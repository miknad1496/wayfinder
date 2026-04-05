/**
 * Patch script: Add premium CSS for full-page essay view.
 * Run: node scripts/patch-essay-css.js
 */

import { readFileSync, writeFileSync } from 'fs';

const cssPath = 'frontend/src/styles/main.css';
let css = readFileSync(cssPath, 'utf-8');

const newCSS = `

/* ═══════════════════════════════════════════════════════════════
   ESSAY VIEW — Premium Full-Page Experience
   Intentionally different from modal-based tools (internships, etc.)
   ═══════════════════════════════════════════════════════════════ */

.essay-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px);
  overflow: hidden;
  background: #fafbfe;
}

/* ─── Header ──────────────────────────────────────────────── */
.ev-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-bottom: 2px solid #fbbf24;
  flex-shrink: 0;
}

.ev-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ev-back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(255,255,255,0.1);
  color: #e2e8f0;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}
.ev-back-btn:hover {
  background: rgba(255,255,255,0.2);
}

.ev-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ev-title {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.3px;
}

.ev-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #1a1a2e;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ev-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ev-credits {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ev-credits-count {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
}

.ev-credits-btn {
  padding: 6px 14px;
  background: #fbbf24;
  color: #1a1a2e;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.ev-credits-btn:hover { background: #f59e0b; }

/* ─── Navigation Tabs ─────────────────────────────────────── */
.ev-nav {
  display: flex;
  gap: 0;
  padding: 0 32px;
  background: #ffffff;
  border-bottom: 1px solid #e5e9f2;
  flex-shrink: 0;
}

.ev-nav-tab {
  padding: 14px 24px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
}
.ev-nav-tab:hover {
  color: #1e293b;
  background: #f8fafc;
}
.ev-nav-tab.active {
  color: #1a1a2e;
  border-bottom-color: #fbbf24;
  font-weight: 600;
}

/* ─── Panels ──────────────────────────────────────────────── */
.ev-panel {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

/* ─── Split Layout (Compose Tab) ──────────────────────────── */
.ev-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  height: 100%;
  min-height: 0;
}

.ev-input-pane {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding-right: 8px;
}

.ev-results-pane {
  overflow-y: auto;
  padding-left: 8px;
}

/* ─── Cards ───────────────────────────────────────────────── */
.ev-input-card {
  background: #ffffff;
  border: 1px solid #e5e9f2;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.ev-card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}

.ev-essay-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 280px;
}

.ev-essay-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}
.ev-essay-header .ev-card-title { margin-bottom: 0; padding-bottom: 0; border: none; }

.ev-word-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ev-word-count {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.ev-word-limit {
  font-size: 12px;
  color: #94a3b8;
  padding: 2px 8px;
  background: #f1f5f9;
  border-radius: 4px;
}
.ev-word-limit.over-limit {
  background: #fee2e2;
  color: #991b1b;
  font-weight: 600;
}
.ev-word-limit.near-limit {
  background: #fef3c7;
  color: #92400e;
}

/* ─── Form Fields ─────────────────────────────────────────── */
.ev-field {
  margin-bottom: 14px;
}
.ev-field:last-child { margin-bottom: 0; }

.ev-field label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  margin-bottom: 6px;
}

.ev-optional {
  font-weight: 400;
  color: #94a3b8;
}

.ev-select, .ev-input {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  color: #1e293b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.ev-select:focus, .ev-input:focus {
  border-color: #fbbf24;
  box-shadow: 0 0 0 3px rgba(251,191,36,0.15);
}

.ev-select-sm {
  width: auto;
  min-width: 180px;
  padding: 8px 12px;
  font-size: 13px;
}

.ev-textarea {
  flex: 1;
  width: 100%;
  min-height: 200px;
  padding: 14px;
  font-size: 15px;
  font-family: 'Georgia', 'Times New Roman', serif;
  line-height: 1.8;
  color: #1e293b;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.ev-textarea:focus {
  border-color: #fbbf24;
  box-shadow: 0 0 0 3px rgba(251,191,36,0.15);
}

.ev-essay-footer {
  margin-top: 8px;
}

.ev-char-count {
  font-size: 12px;
  color: #94a3b8;
}

/* ─── Submit Button ───────────────────────────────────────── */
.ev-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 24px;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(251,191,36,0.3);
}
.ev-submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251,191,36,0.4);
}
.ev-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.ev-submit-msg {
  text-align: center;
  font-size: 13px;
  margin-top: 8px;
}

/* ─── Empty State ─────────────────────────────────────────── */
.ev-empty-state {
  text-align: center;
  padding: 60px 32px;
  color: #64748b;
}
.ev-empty-state h3 {
  font-size: 18px;
  color: #475569;
  margin: 20px 0 8px;
}
.ev-empty-state p {
  font-size: 14px;
  line-height: 1.6;
  max-width: 380px;
  margin: 0 auto 28px;
}

.ev-empty-features {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.ev-feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #64748b;
}

.ev-feature-icon {
  font-size: 16px;
}

/* ─── Review Result (inside results pane) ─────────────────── */
.ev-review-result .essay-result-card {
  background: #ffffff;
  border: 1px solid #e5e9f2;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

/* Override score section styling for light background context */
.ev-review-result .essay-score-section {
  background: linear-gradient(135deg, #fefce8 0%, #fffbeb 100%);
  border-color: #fde68a;
}

/* ─── History Panel ───────────────────────────────────────── */
.ev-history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.ev-history-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.ev-history-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

/* History cards use the same essay-history-card classes from before */

/* ─── Tracker Panel ───────────────────────────────────────── */
.ev-tracker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.ev-tracker-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.ev-score-chart {
  background: #ffffff;
  border: 1px solid #e5e9f2;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  min-height: 120px;
}

/* ─── Upgrade Gate ────────────────────────────────────────── */
.ev-upgrade-gate {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.ev-upgrade-card {
  text-align: center;
  max-width: 520px;
  padding: 48px;
  background: #ffffff;
  border: 1px solid #e5e9f2;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
}
.ev-upgrade-card h2 {
  font-size: 24px;
  color: #1e293b;
  margin: 20px 0 12px;
}
.ev-upgrade-card p {
  font-size: 14px;
  color: #64748b;
  line-height: 1.7;
  margin-bottom: 8px;
}
.ev-upgrade-sub {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 20px;
}
.ev-upgrade-btn {
  padding: 12px 32px;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}
.ev-upgrade-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251,191,36,0.4);
}

/* ─── Mobile Responsive ───────────────────────────────────── */
@media (max-width: 900px) {
  .ev-header { padding: 12px 16px; }
  .ev-brand { display: none; }
  .ev-nav { padding: 0 16px; overflow-x: auto; }
  .ev-nav-tab { padding: 12px 16px; font-size: 13px; white-space: nowrap; }
  .ev-panel { padding: 16px; }
  .ev-split {
    grid-template-columns: 1fr;
    height: auto;
  }
  .ev-results-pane {
    padding-left: 0;
    margin-top: 16px;
  }
  .ev-input-pane { padding-right: 0; }
  .ev-history-list { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .ev-header-right { display: none; }
  .ev-title { font-size: 16px; }
}
`;

css += newCSS;
writeFileSync(cssPath, css, 'utf-8');
console.log('[patch] Appended essay view premium CSS to main.css');
