#!/usr/bin/env node
/**
 * Patch script: Add David coach CSS to main.css
 * Run: node scripts/patch-david-css.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssPath = join(__dirname, '..', 'frontend', 'src', 'styles', 'main.css');

let css = readFileSync(cssPath, 'utf-8');

if (css.includes('.david-widget')) {
  console.log('[SKIP] David CSS already exists');
  process.exit(0);
}

const davidCSS = `

/* ============================================================
   DAVID COACH — Meet David Section (Landing Page)
   ============================================================ */

.meet-david-section {
  margin: 36px 0 28px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 36px 32px;
  border: 1px solid rgba(251, 191, 36, 0.15);
}

.meet-david-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: #d4a853;
  margin-bottom: 20px;
}

.meet-david-content {
  display: flex;
  gap: 28px;
  align-items: flex-start;
}

.meet-david-photo {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(251, 191, 36, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.meet-david-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.meet-david-title {
  font-size: 24px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 12px;
  font-family: Georgia, 'Times New Roman', serif;
}

.meet-david-desc {
  font-size: 14px;
  line-height: 1.65;
  color: #94a3b8;
  margin: 0 0 10px;
}

.meet-david-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.meet-david-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 6px 14px;
}

.meet-david-tag svg {
  stroke: #fbbf24;
}

@media (max-width: 600px) {
  .meet-david-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .meet-david-photo {
    width: 90px;
    height: 90px;
  }
  .meet-david-tags {
    justify-content: center;
  }
  .meet-david-section {
    padding: 24px 20px;
  }
}


/* ============================================================
   DAVID COACH — Floating Chat Widget
   ============================================================ */

.david-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Toggle button */
.david-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid rgba(251, 191, 36, 0.3);
  border-radius: 32px;
  padding: 6px 18px 6px 6px;
  cursor: pointer;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(251, 191, 36, 0.1);
  transition: all 0.25s ease;
}

.david-toggle:hover {
  border-color: rgba(251, 191, 36, 0.5);
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.45), 0 0 20px rgba(251, 191, 36, 0.1);
  transform: translateY(-2px);
}

.david-toggle-img {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(251, 191, 36, 0.25);
}

.david-toggle-badge {
  font-size: 13px;
  font-weight: 600;
  color: #fbbf24;
  white-space: nowrap;
}

/* Chat panel */
.david-chat {
  position: absolute;
  bottom: 64px;
  right: 0;
  width: 380px;
  max-height: 520px;
  background: #0f172a;
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: davidSlideUp 0.25s ease-out;
}

@keyframes davidSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Chat header */
.david-chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-bottom: 1px solid rgba(251, 191, 36, 0.15);
}

.david-chat-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.david-chat-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(251, 191, 36, 0.25);
}

.david-chat-name {
  font-size: 14px;
  font-weight: 700;
  color: #f1f5f9;
}

.david-chat-status {
  font-size: 11px;
  color: #fbbf24;
  font-weight: 500;
}

.david-chat-close {
  background: none;
  border: none;
  color: #64748b;
  font-size: 22px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.15s;
  line-height: 1;
}

.david-chat-close:hover {
  color: #f1f5f9;
  background: rgba(255, 255, 255, 0.08);
}

/* Messages area */
.david-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 280px;
  max-height: 360px;
}

.david-msg {
  display: flex;
  max-width: 88%;
}

.david-msg-assistant {
  align-self: flex-start;
}

.david-msg-user {
  align-self: flex-end;
}

.david-msg-bubble {
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.55;
  color: #e2e8f0;
}

.david-msg-assistant .david-msg-bubble {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom-left-radius: 4px;
}

.david-msg-user .david-msg-bubble {
  background: linear-gradient(135deg, #fbbf24, #d4a853);
  color: #0f172a;
  font-weight: 500;
  border-bottom-right-radius: 4px;
}

.david-msg-typing {
  align-self: flex-start;
}

.david-msg-typing .david-msg-bubble {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom-left-radius: 4px;
  color: #64748b;
  font-style: italic;
}

/* Input area */
.david-chat-input-area {
  display: flex;
  gap: 8px;
  padding: 12px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.15);
}

.david-chat-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 14px;
  color: #e2e8f0;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.david-chat-input::placeholder {
  color: #475569;
}

.david-chat-input:focus {
  border-color: rgba(251, 191, 36, 0.4);
}

.david-chat-send {
  background: linear-gradient(135deg, #fbbf24, #d4a853);
  border: none;
  border-radius: 10px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.david-chat-send svg {
  stroke: #0f172a;
}

.david-chat-send:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
}

.david-chat-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Mobile responsive */
@media (max-width: 500px) {
  .david-widget {
    bottom: 16px;
    right: 16px;
  }
  .david-chat {
    width: calc(100vw - 32px);
    right: 0;
    bottom: 60px;
    max-height: 70vh;
  }
  .david-toggle-badge {
    display: none;
  }
  .david-toggle {
    padding: 4px;
    border-radius: 50%;
  }
}


/* ============================================================
   DAVID COACH — Essay View Guidance
   ============================================================ */

.ev-guidance {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(251, 191, 36, 0.06);
  border: 1px solid rgba(251, 191, 36, 0.15);
  border-radius: 10px;
  margin-bottom: 16px;
}

.ev-guidance-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 1px;
}

.ev-guidance-text {
  font-size: 13px;
  line-height: 1.55;
  color: #94a3b8;
}

.ev-guidance-text strong {
  color: #cbd5e1;
}

.ev-guidance-text a {
  color: #fbbf24;
  text-decoration: none;
  font-weight: 600;
}

.ev-guidance-text a:hover {
  text-decoration: underline;
}
`;

css += davidCSS;
writeFileSync(cssPath, css, 'utf-8');
console.log('[DONE] David coach CSS appended to main.css');
