// PATCH114: International brain framework — Korea-first.
// Auto-discovers backend/knowledge-base/intl/<country>/*.md and exposes:
//   - detectLanguage(text)           : 'en' | 'ko' | 'ja' | 'zh' | 'unknown'
//   - getCountryBrain(country)       : full text of <country>/_brain.md
//   - getAdvisorPrompt(country)      : full text of <country>/advisor-prompt-<lang>.md
//   - searchIntlKnowledge(country, q): scored chunks from country's directory

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const INTL_DIR = join(__dirname, '..', 'knowledge-base', 'intl');

let _cache = null;
async function loadAll() {
  if (_cache) return _cache;
  _cache = {};
  try {
    const countries = await fs.readdir(INTL_DIR, { withFileTypes: true });
    for (const c of countries) {
      if (!c.isDirectory() || c.name.startsWith('_')) continue;
      const country = c.name;
      _cache[country] = {};
      // PATCH115: recursive scan — sub-folders (universities/, high-schools/, strategies/) included.
      async function walk(dir, prefix) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const e of entries) {
          const full = join(dir, e.name);
          if (e.isDirectory()) {
            await walk(full, prefix + e.name + '/');
          } else if (e.isFile() && e.name.endsWith('.md')) {
            const slug = prefix + e.name.replace(/\.md$/, '');
            _cache[country][slug] = await fs.readFile(full, 'utf8');
          }
        }
      }
      await walk(join(INTL_DIR, country), '');
    }
    console.log('[intl-brain] loaded', Object.keys(_cache).length, 'countries:', Object.keys(_cache).join(','));
  } catch (err) {
    console.warn('[intl-brain] load failed:', err.message);
  }
  return _cache;
}
loadAll().catch(() => {});

// Language detection. Hangul block U+AC00–U+D7A3, Jamo U+1100-U+11FF + U+3130-U+318F.
// Hiragana U+3040-U+309F. Katakana U+30A0-U+30FF. Hanzi (CJK Unified) U+4E00-U+9FFF.
export function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'en';
  let ko = 0, ja = 0, zh = 0, total = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp >= 0xAC00 && cp <= 0xD7A3) { ko++; total++; }
    else if (cp >= 0x1100 && cp <= 0x11FF) { ko++; total++; }
    else if (cp >= 0x3130 && cp <= 0x318F) { ko++; total++; }
    else if (cp >= 0x3040 && cp <= 0x309F) { ja++; total++; }
    else if (cp >= 0x30A0 && cp <= 0x30FF) { ja++; total++; }
    else if (cp >= 0x4E00 && cp <= 0x9FFF) { zh++; total++; }
  }
  if (total === 0) return 'en';
  // Korean wins if any Hangul present (strongest signal — Hangul is unique).
  if (ko >= 1) return 'ko';
  // Japanese wins if hiragana/katakana present.
  if (ja >= 1) return 'ja';
  // Hanzi-only without Korean/Japanese is Chinese.
  if (zh >= 1) return 'zh';
  return 'en';
}

// Map language to country (1:1 for now)
export function langToCountry(lang) {
  if (lang === 'ko') return 'korea';
  if (lang === 'ja') return 'japan';
  if (lang === 'zh') return 'china';
  return null;
}

export async function getCountryBrain(country) {
  await loadAll();
  return (_cache[country] && _cache[country]['_brain']) || '';
}

export async function getAdvisorPrompt(country, lang) {
  await loadAll();
  if (!_cache[country]) return '';
  // Try advisor-prompt-<lang>.md; fall back to advisor-prompt.md
  const key = 'advisor-prompt-' + (lang || 'en');
  return _cache[country][key] || _cache[country]['advisor-prompt'] || '';
}

// Lightweight keyword-driven country detection for English queries that
// reference Korea/Japan/China by name (e.g. "best schools in Seoul").
// PATCH117: broadened to catch international-student English queries that benefit
// from Korean context (need-aware, need-blind for international, full-pay strategy,
// Korean family scenarios — even when written in English).
export function detectCountryFromQuery(text) {
  if (!text) return null;
  const q = String(text).toLowerCase();
  const koreaKw = [
    // Direct Korean institution / system references
    'seoul national', 'sky university', 'snu ', ' snu', 'kaist', 'postech', '수능', 'suneung',
    'csat korea', '학종', 'hakjong', '정시', 'jeongsi', '서울대', '연세대', '고려대',
    '외고', '자사고', '과고', '영재고', '대치동', 'gangnam education',
    'korean college admission', 'korea university admission', 'korean university',
    'kmla', 'minjok', 'hafs', 'daewon foreign', 'sangsan', 'hana academy',
    'korean medical school', '의대 한국', 'korean ivy', 'korean sat',
    // Korean family + US admissions context
    'korean family', 'korean student us', 'korean applicant', 'korean parents',
    'korean cultural identity', 'asian-american post-sffa korea',
    'i am korean', 'student from korea', 'student in seoul',
    'us admissions korea', 'us admissions from korea', 'korea to us college',
  ];
  if (koreaKw.some(k => q.includes(k))) return 'korea';
  return null;
}

// Compose the canonical international system-prompt block for a given query.
// PATCH118: smart context selection — advisor prompt (always) + brain (trimmed first 1500 chars,
//   essential top-level orientation only) + top-3 most-keyword-relevant unit files. Cuts injected
//   token count ~75% (was ~30KB → ~6-8KB) which trims Haiku cost from ~$0.015 to ~$0.005/query.
export async function buildIntlContext(country, query, lang) {
  await loadAll();
  if (!_cache[country]) return '';
  const blocks = [];
  const advisor = await getAdvisorPrompt(country, lang);
  if (advisor) blocks.push(advisor);

  // Brain — trim to ~1800 chars (essential orientation only). Full brain not needed every query.
  const brain = _cache[country]['_brain'];
  if (brain) {
    const trimmed = brain.length > 1800 ? brain.slice(0, 1800) + '\n[...] (full brain available; specific files surface based on query)' : brain;
    blocks.push('=== ' + country.toUpperCase() + ' BRAIN (orientation) ===\n' + trimmed);
  }

  // Score + select top 3 unit files
  const otherFiles = Object.entries(_cache[country])
    .filter(([k]) => k !== '_brain' && !k.startsWith('advisor-prompt'));
  if (otherFiles.length > 0 && query) {
    const q = String(query).toLowerCase();
    const tokens = q.split(/[\s,.!?]+/).filter(t => t.length >= 2);
    const scored = otherFiles.map(([slug, content]) => {
      const lower = content.toLowerCase();
      let score = 0;
      for (const t of tokens) {
        const idx = lower.indexOf(t);
        if (idx >= 0) score++;
      }
      // Boost: filename matches in query (e.g. "의대" → medical-schools.md gets +5)
      const slugLower = slug.toLowerCase();
      for (const t of tokens) if (slugLower.indexOf(t) >= 0) score += 3;
      return { slug, content, score };
    }).filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
    for (const s of scored) {
      // Cap each unit file to 4000 chars to keep total context under ~20KB
      const content = s.content.length > 4000 ? s.content.slice(0, 4000) + '\n[truncated]' : s.content;
      blocks.push('=== ' + country.toUpperCase() + ' / ' + s.slug.toUpperCase() + ' ===\n' + content);
    }
  }
  return blocks.join('\n\n');
}

export const _internals = { loadAll };
