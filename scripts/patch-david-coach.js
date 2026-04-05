#!/usr/bin/env node
/**
 * Patch script: Add David coach elements to index.html
 * 1. "Meet David" section on the landing/splash page
 * 2. Floating chat widget (available on every page)
 * 3. User guidance in the essay compose view
 *
 * Run: node scripts/patch-david-coach.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = join(__dirname, '..', 'frontend', 'index.html');

let html = readFileSync(htmlPath, 'utf-8');

// ─── 1. Meet David section in splash ─────────────────────────
const meetDavidSection = `
            <!-- Meet David - Wayfinder Coach -->
            <div class="meet-david-section">
              <div class="meet-david-label">MEET YOUR COACH</div>
              <div class="meet-david-content">
                <div class="meet-david-photo">
                  <img src="/david-coach.jpg" alt="David - Your Wayfinder Coach" />
                </div>
                <div class="meet-david-text">
                  <h2 class="meet-david-title">David is here to help.</h2>
                  <p class="meet-david-desc">Every tool in Wayfinder comes with David &mdash; your AI-powered admissions coach. He&rsquo;s available on every page to answer questions, explain features, and guide you through the college admissions journey.</p>
                  <p class="meet-david-desc">Whether you need help choosing an essay prompt, understanding your financial aid options, or figuring out which summer programs to apply to, David draws on deep admissions intelligence to give you clear, actionable guidance.</p>
                  <div class="meet-david-tags">
                    <span class="meet-david-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> Essay Coaching</span>
                    <span class="meet-david-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> Admissions Strategy</span>
                    <span class="meet-david-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> Financial Aid</span>
                    <span class="meet-david-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> Platform Navigation</span>
                    <span class="meet-david-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> Scholarship Guidance</span>
                  </div>
                </div>
              </div>
            </div>`;

// Insert Meet David section BEFORE the splash-actions div
const splashActionsMarker = '<div class="splash-actions">';
if (html.includes(splashActionsMarker) && !html.includes('meet-david-section')) {
  html = html.replace(splashActionsMarker, meetDavidSection + '\n            ' + splashActionsMarker);
  console.log('[OK] Meet David section added to splash');
} else if (html.includes('meet-david-section')) {
  console.log('[SKIP] Meet David section already exists');
} else {
  console.log('[WARN] Could not find splash-actions marker');
}

// ─── 2. Floating chat widget ─────────────────────────────────
const floatingWidget = `
  <!-- David Coach Chat Widget (floating, every page) -->
  <div id="davidWidget" class="david-widget" style="display:none;">
    <button id="davidToggle" class="david-toggle" title="Ask David">
      <img src="/david-coach.jpg" alt="David" class="david-toggle-img" />
      <span class="david-toggle-badge">Ask David</span>
    </button>

    <div id="davidChat" class="david-chat" style="display:none;">
      <div class="david-chat-header">
        <div class="david-chat-header-left">
          <img src="/david-coach.jpg" alt="David" class="david-chat-avatar" />
          <div>
            <div class="david-chat-name">David</div>
            <div class="david-chat-status">Wayfinder Coach</div>
          </div>
        </div>
        <button id="davidClose" class="david-chat-close" title="Close">&times;</button>
      </div>
      <div id="davidMessages" class="david-chat-messages">
        <div class="david-msg david-msg-assistant">
          <div class="david-msg-bubble">Hey! I'm David, your Wayfinder coach. I can help you navigate the platform, brainstorm essay ideas, or answer questions about the admissions process. What can I help you with?</div>
        </div>
      </div>
      <div class="david-chat-input-area">
        <input type="text" id="davidInput" class="david-chat-input" placeholder="Ask David anything..." maxlength="2000" autocomplete="off" />
        <button id="davidSend" class="david-chat-send" title="Send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        </button>
      </div>
    </div>
  </div>`;

// Insert before </body>
const bodyCloseMarker = '<script type="module" src="/src/app.js"></script>';
if (!html.includes('david-widget')) {
  html = html.replace(bodyCloseMarker, floatingWidget + '\n\n  ' + bodyCloseMarker);
  console.log('[OK] David floating chat widget added');
} else {
  console.log('[SKIP] David widget already exists');
}

// ─── 3. Essay view guidance text ─────────────────────────────
// Add a small guidance callout inside the essay compose panel
const essayGuidance = `
                  <div class="ev-guidance">
                    <div class="ev-guidance-icon">&#x1F4A1;</div>
                    <div class="ev-guidance-text">
                      <strong>Getting started:</strong> Select your essay type and prompt, then paste or write your draft below. When you're ready, hit Submit for a detailed review with scoring, voice assessment, and line-by-line coaching notes. Need help brainstorming? <a href="#" onclick="event.preventDefault(); document.getElementById('davidToggle').click();">Ask David</a> for topic ideas and structure tips.
                    </div>
                  </div>`;

// Insert guidance after the ev-input-pane opening
const evDetailCardMarker = '<div class="ev-detail-card">';
if (!html.includes('ev-guidance') && html.includes(evDetailCardMarker)) {
  html = html.replace(evDetailCardMarker, essayGuidance + '\n                  ' + evDetailCardMarker);
  console.log('[OK] Essay view guidance added');
} else if (html.includes('ev-guidance')) {
  console.log('[SKIP] Essay guidance already exists');
} else {
  console.log('[WARN] Could not find ev-detail-card marker');
}

writeFileSync(htmlPath, html, 'utf-8');
console.log('[DONE] David coach HTML patches applied');
