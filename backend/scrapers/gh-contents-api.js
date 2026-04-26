// gh-contents-api.js — minimal GitHub Contents API helper for grinder tasks.
// Replaces the heavy "rm -rf /tmp/wayfinder && git clone ..." pattern with
// two HTTP calls per file. Eliminates /tmp disk fill, the dominant failure
// mode for the recurring scheduled-task grinders.
//
// Usage:
//   import { getJson, putJson } from './gh-contents-api.js';
//   const { data, sha } = await getJson('backend/data/scraped/programs.json');
//   data.programs.push(newProgram);
//   await putJson('backend/data/scraped/programs.json', data,
//                 'ESMS grinder: +1 verified program', sha);
//
// Env:
//   WAYFINDER_GH_TOKEN  — PAT with contents:write on miknad1496/wayfinder.
//                         Falls back to GITHUB_TOKEN, then GH_TOKEN.
//   WAYFINDER_GH_BRANCH — default "main"
//   WAYFINDER_GH_OWNER  — default "miknad1496"
//   WAYFINDER_GH_REPO   — default "wayfinder"

import https from 'https';

const REPO_OWNER = process.env.WAYFINDER_GH_OWNER || 'miknad1496';
const REPO_NAME  = process.env.WAYFINDER_GH_REPO  || 'wayfinder';
const BRANCH     = process.env.WAYFINDER_GH_BRANCH || 'main';
const COMMITTER_NAME  = process.env.WAYFINDER_GH_COMMITTER_NAME  || 'Wayfinder Grinder';
const COMMITTER_EMAIL = process.env.WAYFINDER_GH_COMMITTER_EMAIL || 'danielyungkim@hotmail.com';

function token() {
  return process.env.WAYFINDER_GH_TOKEN
      || process.env.GITHUB_TOKEN
      || process.env.GH_TOKEN
      || '';
}

function ghFetch(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const tk = token();
    if (!tk) return reject(new Error('No GitHub token in env (set WAYFINDER_GH_TOKEN, GITHUB_TOKEN, or GH_TOKEN).'));
    const data = body ? Buffer.from(JSON.stringify(body)) : null;
    const opts = {
      method,
      hostname: 'api.github.com',
      path: urlPath,
      headers: {
        'User-Agent': 'wayfinder-grinder',
        'Accept': 'application/vnd.github+json',
        'Authorization': 'Bearer ' + tk,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': data.length } : {}),
      },
    };
    const req = https.request(opts, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const txt = Buffer.concat(chunks).toString('utf8');
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(txt)); } catch { resolve(txt); }
        } else {
          reject(new Error('GitHub ' + method + ' ' + urlPath + ' -> ' + res.statusCode + ': ' + txt.slice(0, 400)));
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function rawGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'wayfinder-grinder' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) return resolve(rawGet(res.headers.location));
      if (res.statusCode !== 200) return reject(new Error('Raw GET ' + url + ' -> ' + res.statusCode));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Read a file from the repo at HEAD of BRANCH.
 * Returns { content, sha, size, encoding }.
 * Files larger than 1MB return encoding="none" via Contents API; we transparently
 * fall back to the raw download URL.
 */
export async function getFile(filepath) {
  const enc = filepath.split('/').map(encodeURIComponent).join('/');
  const r = await ghFetch('GET', '/repos/' + REPO_OWNER + '/' + REPO_NAME + '/contents/' + enc + '?ref=' + encodeURIComponent(BRANCH));
  let content;
  if (r.encoding === 'base64' && r.content) {
    content = Buffer.from(String(r.content).replace(/\n/g, ''), 'base64').toString('utf8');
  } else if (r.download_url) {
    content = await rawGet(r.download_url);
  } else {
    throw new Error('Unexpected getFile response shape for ' + filepath);
  }
  return { content, sha: r.sha, size: r.size, encoding: r.encoding };
}

/**
 * Create or update a file. Returns the GitHub commit response.
 * Pass sha when updating; omit when creating.
 */
export async function putFile(filepath, content, message, sha) {
  const enc = filepath.split('/').map(encodeURIComponent).join('/');
  const body = {
    message: message || ('Update ' + filepath),
    content: Buffer.from(String(content), 'utf8').toString('base64'),
    branch: BRANCH,
    committer: { name: COMMITTER_NAME, email: COMMITTER_EMAIL },
  };
  if (sha) body.sha = sha;
  return ghFetch('PUT', '/repos/' + REPO_OWNER + '/' + REPO_NAME + '/contents/' + enc, body);
}

/** Convenience: read+parse JSON. Returns { data, sha }. */
export async function getJson(filepath) {
  const f = await getFile(filepath);
  return { data: JSON.parse(f.content), sha: f.sha };
}

/** Convenience: stringify+write JSON. Pretty-prints with 2-space indent. */
export async function putJson(filepath, data, message, sha) {
  return putFile(filepath, JSON.stringify(data, null, 2) + '\n', message, sha);
}

export default { getFile, putFile, getJson, putJson };
