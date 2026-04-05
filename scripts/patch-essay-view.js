/**
 * Patch script: Convert essay module from modal overlay to full-page premium view.
 *
 * This script:
 * 1. Removes the old essay modal overlay (lines 766-872 area)
 * 2. Inserts a full-page essay view section inside main-wrapper, after </main>
 * 3. The essay view has a split-panel layout (input left, results right)
 *
 * Run: node scripts/patch-essay-view.js
 */

import { readFileSync, writeFileSync } from 'fs';

const indexPath = 'frontend/index.html';
let html = readFileSync(indexPath, 'utf-8');

// ─── Step 1: Remove old essay modal ───────────────────────────
// Find and remove everything between <!-- Essay Reviewer Modal --> and <!-- Internships Modal -->
const essayModalStart = html.indexOf('<!-- Essay Reviewer Modal -->');
const internshipsModalStart = html.indexOf('<!-- Internships Modal -->');

if (essayModalStart === -1 || internshipsModalStart === -1) {
  console.error('Could not find essay modal boundaries. Aborting.');
  process.exit(1);
}

const beforeModal = html.substring(0, essayModalStart);
const afterModal = html.substring(internshipsModalStart);

html = beforeModal + '\n    ' + afterModal;

console.log('[patch] Removed old essay modal overlay');

// ─── Step 2: Insert full-page essay view after </main> ───────
const essayViewHTML = `
      <!-- Essay Reviewer — Full Page Premium View -->
      <section id="essayView" class="essay-view" style="display:none;">
        <!-- Essay View Header -->
        <div class="ev-header">
          <div class="ev-header-left">
            <button id="essayBackBtn" class="ev-back-btn" title="Back to chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
              <span>Back</span>
            </button>
            <div class="ev-brand">
              <h1 class="ev-title">Essay Intelligence Engine</h1>
              <span class="ev-badge">Premium Add-on</span>
            </div>
          </div>
          <div class="ev-header-right">
            <div class="ev-credits" id="evCreditsBar">
              <span id="evCreditsCount" class="ev-credits-count">0 reviews</span>
              <button class="ev-credits-btn" id="evBuyMoreBtn">Buy Credits</button>
            </div>
          </div>
        </div>

        <!-- Essay View Navigation -->
        <nav class="ev-nav" id="evNav">
          <button class="ev-nav-tab active" data-tab="compose">Compose & Review</button>
          <button class="ev-nav-tab" data-tab="history">My Reviews</button>
          <button class="ev-nav-tab" data-tab="tracker">Score Tracker</button>
        </nav>

        <!-- ══════ COMPOSE TAB ══════ -->
        <div id="evComposePanel" class="ev-panel active">
          <div class="ev-split">
            <!-- Left: Essay Input -->
            <div class="ev-input-pane">
              <div class="ev-input-card">
                <h3 class="ev-card-title">Essay Details</h3>

                <div class="ev-field">
                  <label for="evEssayType">Essay Type</label>
                  <select id="evEssayType" class="ev-select">
                    <option value="common-app">Common App Personal Statement</option>
                    <option value="supplemental">Supplemental Essay</option>
                    <option value="why-school">Why This School</option>
                    <option value="diversity">Diversity / Identity Essay</option>
                    <option value="activity">Activity / Extracurricular</option>
                    <option value="community">Community Essay</option>
                    <option value="challenge">Challenge / Setback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div class="ev-field">
                  <label for="evTargetSchool">Target School <span class="ev-optional">(optional)</span></label>
                  <input type="text" id="evTargetSchool" class="ev-input" placeholder="e.g. Stanford, MIT, UW">
                </div>

                <!-- Prompt Picker -->
                <div class="ev-field" id="evPromptPicker">
                  <label for="evPromptCategory">Select a known prompt</label>
                  <select id="evPromptCategory" class="ev-select">
                    <option value="">Choose a prompt set...</option>
                  </select>
                  <div id="evPromptSelectGroup" style="display:none; margin-top:8px;">
                    <select id="evPromptSelect" class="ev-select">
                      <option value="">Choose a specific prompt...</option>
                    </select>
                  </div>
                </div>

                <div class="ev-field">
                  <label for="evPrompt">Or paste your prompt <span class="ev-optional">(optional)</span></label>
                  <input type="text" id="evPrompt" class="ev-input" placeholder="Paste the essay prompt here">
                </div>
              </div>

              <div class="ev-input-card ev-essay-card">
                <div class="ev-essay-header">
                  <h3 class="ev-card-title">Your Essay</h3>
                  <div class="ev-word-info">
                    <span id="evWordCount" class="ev-word-count">0 words</span>
                    <span id="evWordLimit" class="ev-word-limit"></span>
                  </div>
                </div>
                <textarea id="evEssayText" class="ev-textarea" placeholder="Paste or type your essay here..." maxlength="15000"></textarea>
                <div class="ev-essay-footer">
                  <span id="evCharCount" class="ev-char-count">0 / 15,000 characters</span>
                </div>
              </div>

              <button id="evSubmitBtn" class="ev-submit-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                Submit for Review (1 credit)
              </button>
              <p id="evSubmitMsg" class="ev-submit-msg" style="display:none;"></p>
            </div>

            <!-- Right: Review Results -->
            <div class="ev-results-pane">
              <div id="evReviewResult" class="ev-review-result">
                <div class="ev-empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  <h3>Your review will appear here</h3>
                  <p>Submit an essay to receive detailed coaching feedback powered by Wayfinder's admissions intelligence engine.</p>
                  <div class="ev-empty-features">
                    <div class="ev-feature-item">
                      <span class="ev-feature-icon">&#x1F3AF;</span>
                      <span>Score calibrated to real AO standards</span>
                    </div>
                    <div class="ev-feature-item">
                      <span class="ev-feature-icon">&#x1F50D;</span>
                      <span>Line-by-line coaching notes</span>
                    </div>
                    <div class="ev-feature-item">
                      <span class="ev-feature-icon">&#x1F3A4;</span>
                      <span>Voice authenticity assessment</span>
                    </div>
                    <div class="ev-feature-item">
                      <span class="ev-feature-icon">&#x1F4CA;</span>
                      <span>Admissions impact analysis</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ══════ HISTORY TAB ══════ -->
        <div id="evHistoryPanel" class="ev-panel" style="display:none;">
          <div class="ev-history-header">
            <h3>Review History</h3>
            <select id="evHistoryTypeFilter" class="ev-select ev-select-sm">
              <option value="">All Essay Types</option>
              <option value="common-app">Common App</option>
              <option value="supplemental">Supplemental</option>
              <option value="why-school">Why This School</option>
              <option value="diversity">Diversity</option>
              <option value="activity">Activity</option>
              <option value="community">Community</option>
              <option value="challenge">Challenge</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div id="evHistoryList" class="ev-history-list"></div>
          <div id="evHistoryLoading" class="tool-loading" style="display:none;">
            <div class="spinner"></div><span>Loading history...</span>
          </div>
        </div>

        <!-- ══════ TRACKER TAB ══════ -->
        <div id="evTrackerPanel" class="ev-panel" style="display:none;">
          <div class="ev-tracker-header">
            <h3>Score Progression</h3>
            <select id="evTrackerTypeFilter" class="ev-select ev-select-sm">
              <option value="">Select an essay type...</option>
              <option value="common-app">Common App</option>
              <option value="supplemental">Supplemental</option>
              <option value="why-school">Why This School</option>
              <option value="diversity">Diversity</option>
              <option value="activity">Activity</option>
              <option value="community">Community</option>
              <option value="challenge">Challenge</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div id="evScoreChart" class="ev-score-chart"></div>
          <div id="evTrackerReviews" class="ev-tracker-reviews"></div>
        </div>

        <!-- Upgrade Gate (free users) -->
        <div id="evUpgradeGate" class="ev-upgrade-gate" style="display:none;">
          <div class="ev-upgrade-card">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <h2>Essay Intelligence Engine</h2>
            <p>Wayfinder's essay reviewer is built on a distilled intelligence base drawn from admissions officer interview data, school-specific strategy guides, and structured writing craft frameworks. Each review scores your essay 1-10 across multiple dimensions and provides actionable, school-aware feedback.</p>
            <p class="ev-upgrade-sub">Available as a credit-based add-on for Coach and Consultant members.</p>
            <button class="ev-upgrade-btn" id="evUpgradeBtn">Upgrade to Coach</button>
          </div>
        </div>
      </section>`;

// Insert after </main> and before </div> (closing main-wrapper)
const mainClose = '</main>';
const mainCloseIdx = html.indexOf(mainClose);
if (mainCloseIdx === -1) {
  console.error('Could not find </main> tag. Aborting.');
  process.exit(1);
}

const insertPoint = mainCloseIdx + mainClose.length;
html = html.substring(0, insertPoint) + '\n' + essayViewHTML + '\n' + html.substring(insertPoint);

console.log('[patch] Inserted full-page essay view after </main>');

// ─── Step 3: Write back ──────────────────────────────────────
writeFileSync(indexPath, html, 'utf-8');
console.log('[patch] Wrote updated index.html');
console.log('[patch] Done! Essay modal replaced with full-page view.');
