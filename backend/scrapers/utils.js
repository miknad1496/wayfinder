import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = join(__dirname, '..', 'data', 'scraped');

export async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

export async function saveScrapedData(filename, data) {
  await ensureOutputDir();
  const filePath = join(OUTPUT_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  console.log(`  Saved ${filePath} (${Array.isArray(data) ? data.length + ' records' : 'object'})`);
  return filePath;
}

export async function fetchJSON(url, options = {}) {
  const { default: fetch } = await import('node-fetch');
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Wayfinder-Career-Advisor/1.0 (educational-research)',
      'Accept': 'application/json',
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${url}`);
  }

  return response.json();
}

export async function fetchHTML(url) {
  const { default: fetch } = await import('node-fetch');
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Wayfinder-Career-Advisor/1.0 (educational-research)',
      'Accept': 'text/html'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${url}`);
  }

  return response.text();
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
