/**
 * analysis-frameworks.js — Shared structured-analysis framework definitions.
 *
 * Created by REVAMP V2: SLM FRAMEWORKS PATCH42. Extracted verbatim from claude.js so both
 * the engine path (claude.js) and the SLM path (slm.js) can detect and
 * inject the same framework prompts.
 */

const ANALYSIS_FRAMEWORKS = {
  roi_academic: {
    signals: ['roi', 'return on investment', 'worth it', 'payoff', 'cost benefit', 'cost-benefit',
      'game plan', 'academic plan', 'investment', 'value of degree', 'is it worth'],
    prompt: `[ANALYSIS FRAMEWORK: ROI ON ACADEMIC GAME PLAN]
You are producing a structured ROI analysis. Format your response with these sections:

1. INVESTMENT SUMMARY: Total estimated cost (tuition × years + living + opportunity cost of not working)
2. EARNINGS TRAJECTORY: Year 1, Year 5, Year 10, Year 20 projected earnings based on major/school/field data
3. BREAKEVEN ANALYSIS: When does the investment pay for itself vs. entering workforce directly?
4. RISK-ADJUSTED ROI: Account for employment probability, industry stability, and geographic factors
5. ALTERNATIVE PATHS: Compare ROI against 2-3 alternative routes (community college → transfer, bootcamp, direct employment, trades)
6. FORWARD TRAJECTORY: Project 5-10 years ahead — will this field's ROI improve or compress based on pipeline dynamics?
7. VERDICT: Clear recommendation with confidence level (high/medium/low) and key assumptions

Use specific dollar amounts, percentages, and timeframes. Reference BLS median salaries, school-specific earnings data, and industry trends. Always account for student debt load in calculations.`
  },

  forward_compensation: {
    signals: ['future salary', 'future compensation', 'predict', 'projection', 'forecast',
      'years from now', 'when i graduate', 'by the time', 'compensation expectations',
      'future earnings', 'earning potential', 'what will i make', 'salary trajectory'],
    prompt: `[ANALYSIS FRAMEWORK: FORWARD COMPENSATION TRAJECTORY]
You are producing a time-adjusted compensation forecast. Format your response with these sections:

1. CURRENT STATE (Today): Median entry-level salary, typical compensation range (25th-75th percentile), geographic variance
2. GRADUATION TIMELINE: When will this student enter the workforce? (Factor in remaining education years)
3. PIPELINE DYNAMICS: How many students are currently pursuing this field? Is the pipeline growing, stable, or shrinking?
4. SUPPLY/DEMAND FORECAST: Project the job market at graduation time — will there be more or fewer openings? More or fewer qualified candidates?
5. COMPENSATION PROJECTION:
   - Year 0 (entry): projected range accounting for inflation + market conditions
   - Year 3: after building experience
   - Year 5: mid-career trajectory
   - Year 10: senior/management level
   - Year 20: peak earning potential
6. DISRUPTION FACTORS: AI automation risk, industry consolidation, regulatory changes, geographic shifts
7. COMPOUNDING SKILLS PREMIUM: Which skills within this field compound in value vs. commoditize?

Use specific BLS growth projections, known pipeline data, and structural trends. Always distinguish between today's numbers and forward projections. Flag uncertainty levels.`
  },

  perception_vs_reality: {
    signals: ['perception', 'reality', 'myth', 'actually', 'truth about', 'really like',
      'misconception', 'overrated', 'underrated', 'hype', 'bubble', 'everyone says',
      'people think', 'common belief', 'vs reality', 'versus reality'],
    prompt: `[ANALYSIS FRAMEWORK: PERCEPTION VS. FORWARD REALITY]
You are producing a perception-reality gap analysis. Format your response with these sections:

1. POPULAR PERCEPTION: What most people (students, parents, media) currently believe about this field/school/career path
2. CURRENT REALITY: What the data actually shows TODAY — use real numbers, not vibes
3. FORWARD REALITY (3-5 years): Where this is ACTUALLY heading based on structural trends, pipeline dynamics, and emerging signals
4. THE GAP: Where is the biggest disconnect between perception and reality? Quantify it where possible
5. WHO BENEFITS FROM THE PERCEPTION: Follow the incentives — who profits from maintaining the current narrative? (Schools? Employers? Media?)
6. CONTRARIAN PLAY: What's the strategic opportunity that most people are missing because they're following perception, not reality?
7. WAYFINDER VERDICT: Our honest, data-backed take — with specific recommendations

Be bold, honest, and data-driven. This is where Wayfinder's forward-looking philosophy shines.`
  }
};

/**
 * Detect if the user's query triggers a structured analysis framework.
 * Returns the framework prompt to inject, or null.
 */
function detectAnalysisFramework(query) {
  if (!query) return null;
  const lower = query.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const [name, framework] of Object.entries(ANALYSIS_FRAMEWORKS)) {
    let hits = 0;
    for (const signal of framework.signals) {
      if (lower.includes(signal)) hits++;
    }
    if (hits >= 2 && hits > bestScore) {
      bestScore = hits;
      bestMatch = { name, prompt: framework.prompt };
    }
  }

  // Also trigger on explicit requests
  if (lower.includes('full analysis') || lower.includes('deep analysis') || lower.includes('full pull')) {
    // Pick the most relevant framework based on any signal hit
    for (const [name, framework] of Object.entries(ANALYSIS_FRAMEWORKS)) {
      for (const signal of framework.signals) {
        if (lower.includes(signal)) {
          return { name, prompt: framework.prompt };
        }
      }
    }
  }

  return bestMatch;
}

export { ANALYSIS_FRAMEWORKS, detectAnalysisFramework };
