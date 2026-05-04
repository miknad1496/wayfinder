# AP STUDY GUIDE BRAIN FILE

**Purpose.** This is the complete intelligence file for building AP exam study guides. It captures every design pattern, per-subject differentiator, rubric structure, anti-pattern, and pedagogical principle developed across 26+ universal multi-tier guides plus earlier kid-specific guides. Feed this to a fresh Claude/Wayfinder thread to load full context for AP guide work.

**Library coverage.** As of last update, the universal multi-tier library spans every AP exam a typical client is likely to face: all sciences (Bio, Chem, Env, Physics 1/2/C Mech/C E&M), all math (Calc AB/BC, Stats), economics (Macro, Micro), Computer Science (CSP, CS A), all major social studies (APUSH, World, Euro, Gov, Human Geo, Psych), both English (Lang, Lit), languages (Spanish, French), and arts (Music Theory, Art History). Plus earlier kid-specific 5-target / 4-target guides for Chem, APUSH, Physics 1, Lang, Gov, Precalc, Macro, Stats.

**Read this top-to-bottom before generating any new guide.** It lets you hit the ground running with established patterns rather than rediscovering them.

---

## SECTION 1 — MISSION & DESIGN PHILOSOPHY

The mission: **build study guides that are dense enough to be definitive, but readable enough to actually use the night before the exam.** Each guide is exactly 10 pages, multi-tiered for 3/4/5 score targets, and ends with a single sentence the student can carry into the exam room.

Design principles, in priority order:

1. **Specificity beats coverage.** A guide that names 12 specific cases, dates, formulas is more useful than one that vaguely covers 50 topics. Vague generalities lose AP points; named specifics win.
2. **Tier-aware.** A student going for a 3 should be able to read [3]-only items and ignore the rest. A 5-target student studies all three tiers. The guide should never make a 3-target student feel they're failing.
3. **Templated answers beat clever answers.** AP rubrics reward predictable structures (PHANTOMS for Stats, D-A-C for Art History, device→effect→purpose for AP Lang). Teach the template; the cleverness will follow.
4. **Differentiator first.** Every guide has ONE signature feature that makes it distinctive — the master models page in Human Geo, the 5 master graphs in Macro, the 9 docs + 15 cases in AP Gov. Lead with the differentiator; readers remember it.
5. **The "One Thing"** closes every guide. Italic, bold, centered, single sentence: "If you do nothing else..." This is the takeaway a student carries into the exam.

---

## SECTION 2 — THE UNIVERSAL MULTI-TIER SYSTEM

The single most important methodological innovation. Every concept tagged with one of three badges:

- **[3]** cyan highlight, dark blue text — foundational
- **[4]** green highlight, dark green text — adds for 4+
- **[5]** yellow highlight, dark gold text — adds for 5

**Reading rule (state explicitly in every guide):** Badge marks the LOWEST tier where the concept matters. Targeting a 4 → study [3] AND [4] items. Targeting a 5 → study all three tiers.

**Implementation.** In `parseInline`, regex matches `[3]`, `[4]`, `[5]` and renders them as small bold colored TextRuns with highlight property:

```javascript
if (seg === '[3]') runs.push(tx(' [3] ', { ...baseOpts, bold: true, size: 13, color: C.t3Text, highlight: 'cyan' }));
else if (seg === '[4]') runs.push(tx(' [4] ', { ...baseOpts, bold: true, size: 13, color: C.t4Text, highlight: 'green' }));
else if (seg === '[5]') runs.push(tx(' [5] ', { ...baseOpts, bold: true, size: 13, color: C.t5Text, highlight: 'yellow' }));
```

**Tagging discipline.** A concept is [3] if a 3-target student needs it (basic units, central formulas, identity). [4] if it's the next layer needed for stronger work (e.g., conditions, complications, secondary patterns). [5] if it's the sophisticated edge (counter-arguments, nuance, advanced applications).

---

## SECTION 3 — THE UNIVERSAL 10-PAGE TEMPLATE

Every guide is exactly 10 pages, structured as follows:

**Page 1 — Math of 3/4/5 + Units + Headline Differentiator.** Always opens with: (a) "About this exam" paragraph framing the unique challenge, (b) Math of 3/4/5 confidence-builder table, (c) units-by-weight table, (d) the headline differentiator preview (5 master graphs, 17 models, 9 docs + 15 cases, 6 calculus definitions, etc.).

**Pages 2–8 — Content body.** Each page covers 1–2 units (or thematic bundles) with:
- Big banner header
- Section heads with color-coded underlines
- Mix of bullets, formulaBox / codeBox, dataTables
- 1–2 callouts per page (insight or warning)

**Page 9 — FRQ strategy / decoder.** Always includes: (a) FRQ structure breakdown (how many, what types, time allocation), (b) the answer template/recipe, (c) common point-killers for that subject, (d) timing strategy.

**Page 10 — Score Ladder + Tier Checklists + The One Thing.** Closing capstone:
- Three-column Score Ladder (For a 3 / For a 4 / For a 5) with same row categories across all three columns
- Three tier-specific test-day checklists (For a 3 — focus only on these / For a 4 — add these / For a 5 — add these)
- "THE ONE THING THAT MATTERS MOST [3][4][5]" paragraph
- Italic centered "If you do nothing else..." closer

---

## SECTION 4 — UNIVERSAL CODE ARCHITECTURE

All guides built in Node.js + docx-js. The pattern stabilized after ~5 iterations and is now ~95% template + 5% subject customization per guide.

### Core helpers (in every guide)

```
parseInline(text, baseOpts)       — markdown-style inline rendering
  Supports: **bold**, _italic_, `code`, [3], [4], [5]
plainPara(text, opts, paraOpts)   — standard paragraph with parseInline
bullet(text)                       — bulleted list item
bigBanner(label, title, color)    — full-width colored page header
sectionHead(text, color)          — section heading with colored underline
callout(text, label, fill, border, textColor)  — base for insight/warning
insight(t)                        — key-insight callout (cyan)
warning(t)                        — watch-out callout (yellow)
dataTable(columnWidths, headerCells, bodyRows) — striped table with parseInline cells
pageBreak()                       — page break paragraph
formulaBox(lines)                 — boxed monospace block (formulas)
codeBox(lines)                    — boxed monospace block (code, slightly different styling)
```

### Color object (`C`)

```javascript
const C = {
  rowAlt: "F4F6FA", rowHead: "E8EAF6",
  primary: "<subject-tone>",       // distinctive primary color per subject
  page2-page10: distinct colors   // each page has its own banner color
  t3Text: "01579B", t4Text: "1B5E20", t5Text: "B8860B",
  formula: "<light>", formulaBorder: "<dark>",
  insight: "E1F5FE", insightBorder: "0288D1", insightText: "01579B",
  warn: "FFF8E1", warnBorder: "F9A825", warnText: "B8860B",
};
```

### Subject-color conventions (inherited but adjustable)

| Subject family | Primary color |
|---|---|
| Math/Stats/Macro/Micro/CS | Deep blue (0D47A1, 1A237E) |
| Sciences (Chem, Physics) | Deep blue or navy |
| History (APUSH, World, Euro) | Navy 1A237E |
| English/Lang | Deep blue |
| Spanish | Spanish red B71C1C |
| French | French navy 0D47A1 |
| Music Theory | Purple 4A148C |
| Art History | Burgundy 880E4F |

### Document setup (boilerplate)

```javascript
sections: [{
  properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 520, right: 1000, bottom: 480, left: 1000 } } },
  headers: { default: new Header({ ... }) },     // subject name italic right-aligned
  footers: { default: new Footer({ ... }) },     // "Page X of Y" centered
  children: content
}]
```

US Letter at 12240 × 15840 DXA. Tight margins (520/480 top/bottom) maximize content area. Calibri body, Consolas for code/formulas — Cambria Math caused rendering issues (turned "p" into "Þ").

### Build & verification pipeline

```
node build_<subject>.js "<filename>.docx"
soffice --headless --convert-to pdf "<filename>.docx"
pdfinfo "<filename>.pdf" | grep Pages
cp "<filename>.docx" "<workspace>/<filename>.docx"
```

Always verify page count = 10 before delivering. If overflow, compression sequence: cell padding → spacing → font size → margins. AP Bio originally rendered 19 pages; tightening compressed to 12, then to 10 in later iterations.

---

## SECTION 5 — SUBJECT CATEGORIES (THE 8 SHAPES)

Across 26 guides, AP exams cluster into 8 functional categories. Recognizing the category drives the guide's differentiator and structure.

### 1. Lab Sciences with FRQ math + reasoning
**Members:** Chem, Bio, Env Sci, Physics 1, Physics 2, Physics C Mech, Physics C E&M.
**Signature:** Show-all-work + units + sig figs discipline. Particle-level (Chem) or paragraph-argument (Physics) reasoning. Lab/experimental design FRQ. Master equations / integral patterns reference.

### 2. Math
**Members:** Calc AB, Calc BC, Stats, Precalc.
**Signature:** Master theorems / formulas page. Worked examples for canonical problem types. "Carry symbols, plug numbers last." For Stats: 3-distributions distinction, PHANTOMS template, verbatim conclusion language. For Calc: 5 master theorems (IVT, EVT, MVT, FTC1, FTC2). For BC: AB content + parametric/polar/vector + sequences/series with Maclaurin series memorization.

### 3. Economics with graphs
**Members:** Macroeconomics, Microeconomics.
**Signature:** Master graphs page with shift-direction tables. Macro = 5 master graphs (AD/AS, Money Market, Loanable Funds, Phillips, FX). Micro = 4 market structure comparison (perfect comp, monopoly, monopolistic comp, oligopoly). FRQ rubric: label every curve, axes, equilibrium point, and shift arrow — missing labels lose ~30% per FRQ.

### 4. History/Social Studies (DBQ-LEQ-SAQ format)
**Members:** APUSH, AP World, AP Euro, AP Human Geography (closer to social studies hybrid).
**Signature:** Periods + themes reference. APUSH = 9 periods + 7 themes (NAT-WXT-GEO-MIG-PCE-WOR-ARC). World = 9 units in 4 eras. Euro = 12 turning-point dates + isms matrix. HIPP sourcing (Historical situation, Intended audience, Point of view, Purpose) for 2 docs minimum. Complex understanding move = the [5] point.

### 5. AP Gov (rubric-driven, document-driven)
**Member:** AP US Government & Politics.
**Signature:** 9 required foundational documents + 15 required SCOTUS cases. Q3 SCOTUS Comparison tactic (identify clause → match required case → compare reasoning). Q4 Argument Essay 6-point checklist (thesis, 2 evidence, evidence→argument, opposing perspective, complex understanding).

### 6. Composition / Literature analysis
**Members:** AP Lang, AP Lit.
**Signature:** Universal 6-point rubric (Thesis 1 + Evidence/Commentary 4 + Sophistication 1). Same scaffold across all essays. AP Lang = device→effect→purpose universal sentence pattern, SOAPSTone, Q3 evidence bank pre-loaded by domain. AP Lit = device→effect→purpose for fiction/poetry, sample passage walkthrough.

### 7. Computer Science
**Members:** CS A (Java), CSP (pseudocode + Big Ideas).
**Signature for CS A:** Universal class template (instance vars + constructor + getters + toString) for FRQ Q2. ArrayList remove pitfall (count down or don't increment). 4 fixed FRQs (methods, class, array/ArrayList, 2D). Real Java with semicolons + braces — graders punish pseudo-Java.
**Signature for CSP:** AP-pseudocode reference (1-indexed lists!). Create PT 6 row-points checklist. Big Idea 5 (Impact) is 21–26% — bigger than Big Ideas 1, 2, or 4 — students underestimate. Trace-table superpower for "what's the output?" MCQs.

### 8. Language proficiency / specialized
**Members:** AP Spanish Language & Culture, AP French Language & Culture, AP Music Theory, AP Art History.
**Signature:** Subject-specific format that doesn't fit other categories.

For **Spanish/French Language:** 6 themes + 3 modes framework. 4-task FRQ recipe (Email Reply / Argumentative Essay / Conversation / Cultural Comparison). Subjunctive as 4-to-5 barrier (WEIRDO triggers in Spanish; bien que / pour que / à moins que in French). Pre-loaded country toolkit. Power Phrases bank. The "fill every speaking second" rule. Refrán/proverb for the 5-bar.

For **AP Music Theory:** 3-part exam (MCQ aural + non-aural + FRQ written + sight-singing recorded). Tonal anchoring as 3→5 skill. Part-writing voice-leading rules. V→I voice-leading walkthrough showing each voice's motion. 30-day prep plan (can't cram).

For **AP Art History:** 250 required works. D-A-C answer structure (Describe → Analyze → Connect). Visual-analysis vocabulary. Critical frameworks for FRQ #6 (patronage, gender, colonialism, function, reception). Iconography table. Attribution FRQ recipe.

---

## SECTION 6 — PER-SUBJECT DIFFERENTIATORS (THE SIGNATURE FEATURE)

Every guide must lead with ONE signature feature that's the takeaway. This is what students remember 6 months later.

| Exam | Signature Differentiator |
|---|---|
| **AP Bio** | 8 units + 4 Big Ideas; signature page = master vocabulary |
| **AP Calc AB** | 5 master theorems (IVT, EVT, MVT, FTC1, FTC2); 6 fixed FRQ types |
| **AP Calc BC** | AB content + parametric/polar/vector + sequences/series; 6 famous Maclaurin series |
| **AP Statistics** | 3 distributions (population vs data vs sampling); PHANTOMS template; verbatim conclusion language; inference decision tree |
| **AP Psychology** | Post-2024 redesigned 5-unit structure; AAQ + EBQ FRQ format; Famous Studies & Researchers reference page |
| **AP English Lang** | Universal 6-point rubric; device→effect→purpose universal sentence; pre-loaded Q3 evidence bank by domain (history/lit/current/personal); 4 sophistication paths |
| **AP English Lit** | Q3 free-response strategy; Hamlet soliloquy walkthrough; differentiated from AP Lang |
| **AP World History** | 9 units in 4 eras; comparative frameworks across regions; Universal Evidence Bank |
| **AP Macro** | 5 master graphs page (AD/AS, Money Market, Loanable Funds, Phillips, FX); shift-direction tables; Money Market vs Loanable Funds (nominal vs real interest rate) distinction |
| **AP Micro** | Market Structure Comparison Table; 5 master graphs |
| **AP Env Science** | Famous case studies page (Love Canal, Chernobyl, Bhopal); environmental laws by name + year |
| **AP Human Geography** | 17 theoretical models page (DTM, Ravenstein, von Thünen, Christaller, Burgess, Hoyt, Harris-Ullman, Latin American/African/SE Asian urban, Rostow, Wallerstein, Weber, Malthus/Boserup) |
| **AP CSP** | AP-pseudocode reference (1-indexed!); Create PT 6 row-points; trace-table strategy; Big Idea 5 = 21-26% (sneaky) |
| **AP Euro History** | 12 turning-point dates (1450, 1517, 1648, 1687, 1789, 1815, 1848, 1871, 1914, 1917, 1945, 1989); 11-row "isms" matrix; Change-Over-Time threads |
| **AP CS A** | Universal class template; ArrayList remove pitfall; 4 predictable FRQs; "write exact compilable Java, not pseudocode" |
| **AP Physics C: Mech** | 7 master integration patterns (find v from a, work from F(x), impulse from F(t), x_CM, I=∫r²dm, drag ODE, F=−dU/dx) |
| **AP Spanish Language** | Subjunctive WEIRDO triggers; 4-task FRQ recipe; Power Phrases bank; pre-loaded country toolkit |
| **APUSH** | 9 periods + 7 themes (NAT-WXT-GEO-MIG-PCE-WOR-ARC); HIPP sourcing worked example; Reconstruction-as-unfinished-revolution thesis |
| **AP US Gov** | 9 required foundational documents + 15 required SCOTUS cases; Q3 SCOTUS comparison tactic; Q4 Argument 6-point checklist |
| **AP Chemistry** | Particulate-level reasoning explicitly framed; 3 Great Connections (ΔG° = −RT·ln(K), ΔG° = −nFE°, K ↔ E°); Le Chatelier ↔ Q vs K; half-equivalence point = pKa |
| **AP Physics 1** | 5-sentence paragraph argument template (state law → identify forces → apply law → derive → interpret); FBD discipline; "What provides centripetal force?" decoder |
| **AP Physics 2** | P-V diagram process matrix (isothermal/isobaric/isochoric/adiabatic); resistor vs capacitor opposite-rules; Faraday + Lenz "induced current opposes the CHANGE" |
| **AP Physics C: E&M** | Symmetry-based Gauss/Ampère decision tree; 7 master integral patterns; LC ↔ mass-spring analogy (Q↔x, L↔m, 1/C↔k); Maxwell's equations as unifying principles |
| **AP Music Theory** | 3-part exam structure; tonal anchoring as 3→5 skill; V→I voice-leading walkthrough; 30-day non-crammable prep plan |
| **AP French** | DR + MRS VANDERTRAMP for être verbs; subjunctive as 4-to-5 barrier; pre-loaded Francophone country toolkit (France/Québec/Sénégal/Maroc/Côte d'Ivoire); distinctly-French vocabulary (laïcité, terroir, savoir-vivre) |
| **AP Art History** | D-A-C answer structure (Describe → Analyze → Connect); 250 works; iconography table; "-isms reaction chain" framing; 8 critical frameworks for FRQ #6 |

---

## SECTION 7 — UNIVERSAL RUBRIC STRUCTURES

Each subject category has its own rubric, but patterns recur. Memorize these:

### The 6-point rubric (AP Lang, AP Lit, similar)
- Thesis: 1
- Evidence + Commentary: 4
- Sophistication: 1

The sophistication point is the 4→5 jump. AP Lang has 4 named paths: nuance, complexity, broader context, vivid style.

### The 7-point DBQ rubric (APUSH, AP World, AP Euro)
- Thesis: 1
- Contextualization: 1
- Evidence: 1 for 4 docs + 3 for using 6 docs to support argument
- Outside evidence: 1
- HIPP sourcing for 2 docs: 1
- Complex understanding: 1

### The 6-point LEQ rubric (history)
- Thesis: 1
- Context: 1
- Evidence: 1
- Evidence → argument: 1
- Reasoning structure: 1
- Complex understanding: 1

### The 9-point SAQ (history)
- 3 questions × 3 points each
- Each part = 1 sentence claim + 1 specific evidence + 1 sentence elaboration

### The 5-point Spanish/French language rubric (per task)
- Task completion (addressed every part?)
- Topic development (depth + specificity + cultural content)
- Language use (grammar, vocabulary, fluency)
- 5 = STRONG | 4 = GOOD | 3 = ADEQUATE | 2 = WEAK | 1 = POOR | 0 = off-topic/blank/English

### AP Gov FRQ rubrics
- Q1 Concept Application: 3 points (1 each part A/B/C)
- Q2 Quantitative Analysis: 4 points
- Q3 SCOTUS Comparison: 4 points (1 clause + 2 facts of required case + 1 impact)
- Q4 Argument Essay: 6 points (thesis, evidence 1, evidence 2, evidence→argument, opposing perspective, complex understanding)

### AP CSP Create PT: 6 row-points
1. Program purpose & function
2. Function development (student-developed procedure that does meaningful work)
3. Use of a list/collection
4. Use of iteration
5. Procedure with parameters that meaningfully affect behavior
6. Algorithm with selection AND iteration inside the procedure

The simplest design hitting all 6: a procedure that takes (list, target) as parameters, uses a loop + IF to count occurrences/filter, returns result. Hits rows 2/3/4/5/6 in one move.

### AP CS A FRQs
4 fixed types: Q1 methods + control flow (lowest difficulty), Q2 class design (universal class template), Q3 array/ArrayList (watch remove pitfall), Q4 2D array (row-major nested loops).

### AP Music Theory FRQ rubric
9 sections. Q1-Q2 melodic dictation (~12 min). Q3-Q4 harmonic dictation (~16 min). Q5 part-writing figured bass + Q6 Roman numerals (~30 min combined). Q7 melody composition (~10 min). Q8-Q9 sight-singing (recorded, 30 sec prep + 30 sec sing each).

---

## SECTION 8 — SOPHISTICATION PATHS (THE 3→5 JUMP)

Every guide should explicitly address how to break from 4 into 5. Patterns:

### Sophistication = nuance, complexity, broader context, OR vivid style (AP Lang)
Phrases that signal it:
- "While X holds in [context], the more compelling case is..."
- "This passage's apparent simplicity belies a deeper tension between..."
- "By [device], the author both [effect 1] AND [effect 2] — a strategic doubling."

### Complex understanding (DBQ/LEQ)
- Acknowledge tensions/complications
- Analyze multiple causes
- Modify thesis with qualification
- Engage counter-evidence + rebuttal

### Limit-case checks (Physics, Calc)
- "If μ = 0, this reduces to g sin θ" — verifies sign + limit behavior
- Catches errors AND demonstrates rigor

### Particulate-level → macro reasoning (Chem)
- "NaCl dissolves" earns 0
- "Polar water orients its dipoles around Na⁺ and Cl⁻ ions, creating ion-dipole interactions stronger than the ionic bonds in the solid lattice" earns full credit

### Subjunctive + idioms in language exams (Spanish/French)
- 5-target student drops subjunctive in every task
- 1 refrán/proverb in Cultural Comparison signals cultural fluency

### Critical framework application (Art History)
- FRQ #6 asks for theoretical perspective
- Pre-load 2-3 frameworks (patronage, gender, colonialism)

### Tonal/functional thinking (Music Theory)
- Think "sol" not "up a P5"
- Hear chords as "V" not "G major"
- Read leading tone as "wants to resolve up"

---

## SECTION 9 — UNIVERSAL ANSWER TEMPLATES

When the rubric is structurable, the guide gives the student a verbatim template.

### PHANTOMS (AP Stats inference)
- **P** Parameter — define in CONTEXT
- **H** Hypotheses — symbols + words
- **A** Assumptions / Conditions — VERIFY each
- **N** Name the test
- **T** Test statistic + p-value
- **O** Obtain conclusion in CONTEXT
- **M** Make decision (reject / fail to reject)
- **S** State conclusion in CONTEXT

### Conclusion templates (AP Stats — verbatim)
- **Reject H₀:** "Since p-value (___) < α (___), we REJECT H₀. There IS convincing evidence that [Hₐ in context]."
- **Fail to reject:** "Since p-value (___) > α (___), we FAIL to reject H₀. There is NOT convincing evidence that [Hₐ in context]."
- **Confidence interval:** "We are ___% confident that the true [parameter in context] is between ___ and ___."

NEVER write "accept H₀". NEVER write "probability the parameter is in interval".

### Device → Effect → Purpose (AP Lang Q2)
"In paragraph X, [author] uses [DEVICE] to [EFFECT]. By [quoting] '[evidence]', [author] [creates] [reaction] in the audience, which advances [purpose]."

### D-A-C (AP Art History)
- **Describe**: what you literally see
- **Analyze**: what the visual choices DO
- **Connect**: cultural/historical/functional context

Each FRQ paragraph layers all three.

### 5-sentence paragraph argument (AP Physics 1)
1. State the law/principle by name
2. Identify the relevant forces/quantities in this scenario
3. Apply the law: write the relationship
4. Derive/compare to get the conclusion
5. Interpret / connect to question asked

### Universal Java class template (AP CS A)
1. Instance variables (always private)
2. Constructor
3. Accessors (getters)
4. Mutators (setters) — only if needed
5. Other methods
6. toString (often required)

### Email Reply (Spanish/French Q1)
1. Formal greeting (Estimado/Madame, Monsieur,)
2. Thanking + acknowledgment
3. Answer EVERY question
4. Ask 1+ original question (required! Often missed)
5. Formal closing

### Cultural Comparison (Spanish/French Q4) — 2-min recipe
- Intro (15-20 sec): "I will compare [topic] between US and [specific country]"
- US perspective (40 sec): specific examples, concrete
- Spanish-speaking/Francophone perspective (40 sec): SPECIFIC country + concrete examples
- Comparison/contrast (15-20 sec): "Although both cultures..., one important difference is..."
- Conclusion (10 sec): "In summary..."

### Attribution FRQ (Art History #5)
1. State your attribution clearly ("This work is most likely Byzantine, 9th-12th century")
2. TWO specific visual features supporting attribution
3. Connect each feature to period conventions
4. Briefly acknowledge alternative attribution + explain why yours is stronger

---

## SECTION 10 — ANTI-PATTERNS & POINT-KILLERS (CATALOG)

Cross-subject point-losing habits. Every guide should warn against these.

### Universal anti-patterns
- **Vague generalities lose; specific names + dates + people win** (history, social studies, languages)
- **Summarizing instead of analyzing** (English Lang/Lit, history, Art History)
- **Naked answer without work** (math, physics, chem) — graders give partial credit only when work shown
- **Missing units / sig figs / context** on numerical answers (sciences, math)

### Stats-specific
- "Accept H₀" — always "fail to reject"
- "Probability the parameter is in interval" — parameter is fixed
- Forgetting "true" in CI interpretations
- Conclusion not in CONTEXT

### CS A-specific
- `String == "Hello"` — always use `.equals()`
- `5/2` returns 2 (integer division) — cast to double
- ArrayList remove + i++ skips next element — count down
- Lists in AP pseudocode are 1-INDEXED

### Physics-specific
- "Centrifugal force" (in inertial frames, only centripetal)
- At peak of toss: v = 0 but a ≠ 0 (still −g)
- F_c is NOT a separate force — it's the NET force pointing toward center
- Action-reaction (N3) pairs act on DIFFERENT objects
- Magnetic force does NO work (only changes direction)
- Capacitors series/parallel rules OPPOSITE of resistors

### Chem-specific
- Wrong sign on ΔH or ΔS (exothermic = negative ΔH)
- Plug into Henderson-Hasselbalch BEFORE neutralization stoichiometry — react FIRST, then HH
- K_c vs K_p for gas reactions
- Anode = oxidation, Cathode = reduction (AnOx-RedCat)
- ΔT = T_f − T_i (final minus initial)

### History-specific
- "The government took action" earns 0 — name the law/case/person
- Restating prompt as thesis (no thesis point)
- Citing only 4 docs in DBQ when 6 are needed for full evidence point
- HIPP for fewer than 2 documents

### AP Gov-specific
- Naming a case but not the clause it interprets
- Writing about a SCOTUS case without citing the actual holding
- Q4 Argument: not addressing opposing perspective explicitly
- Forgetting to cite a foundational document by name

### AP Lang/Lit-specific
- "The author uses ethos, pathos, and logos" — listing devices without analyzing
- Pure summary ("the author talks about X, then Y")
- Vague evidence ("the author mentions freedom") — need quotes or specifics
- No defensible thesis (just restating prompt)

### Languages (Spanish/French)-specific
- One English word in recorded response = lost points
- Forgetting to ask a question in Email Reply (single most common deduction)
- Wrong register (TÚ in formal email or USTED in informal conversation)
- Avoiding subjunctive entirely (caps at 4)
- No specific country in Cultural Comparison

### Art History-specific
- Pure description without analysis or context
- "It's beautiful / interesting" — need specific vocabulary
- Wrong period attribution
- Generic context ("during the Renaissance...")
- No critical framework on FRQ #6

### Music Theory-specific
- Doubling leading tone in part-writing (never)
- Parallel 5ths/8ves (automatic deduction)
- Skipping rhythm in dictation (write rhythm first, pitches second)
- Restarting sight-sing (you don't get more time)
- Sight-singing without singing tonic chord first

---

## SECTION 11 — SUBJECT-SPECIFIC TACTICAL INSIGHTS

The "secret weapon" insights that aren't obvious from the curriculum guide alone.

### AP Stats
- Half the FRQ rubric is statistical English, not math
- The 3 distributions distinction is the most-tested concept
- Q6 Investigative Task is ~25% of FRQ score; connect novel ideas to known framework

### AP CSP
- Big Idea 5 (Impact) is 21-26% of exam — bigger than most realize
- Hand-trace every "what's the output?" question on scratch paper
- The simplest Create PT design hits all 6 row-points: procedure(list, target) → loop + IF

### AP Macro
- Money Market = nominal interest rate, set by Fed
- Loanable Funds = real interest rate, market for borrowing/saving
- Crowding out happens via Loanable Funds, not Money Market
- Strong dollar HURTS exports (NX falls)

### AP Chem
- The 3 Great Connections: ΔG° = −RT·ln(K), ΔG° = −nFE°, K ↔ E°
- Half-equivalence point = pKa on titration curves
- React acid/base with buffer FIRST, THEN apply Henderson-Hasselbalch
- Particulate diagrams must be JUSTIFIED, not just drawn

### AP Physics 1
- Use ENERGY first when asked about FINAL SPEED — bypasses path; only initial + final states matter
- Period of pendulum (T = 2π√(L/g)) is INDEPENDENT of mass and amplitude (small θ)
- F_c is provided BY: friction (car turning), tension (ball on string), gravity (orbit), normal+gravity (top of loop)

### AP Physics C: Mech
- Always ask "INTEGRAL or DERIVATIVE?" before pushing algebra
- Variable a → integrate. Variable F → integrate.
- Compute V (scalar) then E = −dV/dx is OFTEN easier than direct E integration

### AP Physics C: E&M
- Use SYMMETRY to pick Gauss surface or Amperian loop
- Spherical → Gauss with sphere
- Cylindrical → Gauss/Ampère with cylinder
- Planar → Gauss with pillbox
- Solenoid → Ampère with rectangle
- LC oscillation ↔ mass-spring (Q ↔ x, L ↔ m, 1/C ↔ k)

### AP Physics 2
- Every Physics 2 problem reduces to one conservation: charge (Kirchhoff), energy (1st law/Bernoulli/collisions), flux change (Faraday/Lenz), or momentum
- Cap at t=0: wire (V=0). Cap at t=∞: open (I=0)
- P-V diagram: cycle clockwise = heat engine, counterclockwise = refrigerator

### AP Music Theory
- Tonal anchoring is THE 3→5 skill: think "sol" not "up a P5"
- Sing tonic chord BEFORE sight-singing to anchor pitch
- On harmonic dictation: identify FUNCTION first (T-PD-D-T), exact chord second
- Can't be crammed: 30-day plan with daily aural + sight-sing practice

### AP Art History
- Every observation must do work — visual evidence → interpretation → context
- 250 works memorization with: title, artist, date, culture, materials, 2-3 visual features, function, significance
- Critical framework for FRQ #6: pre-load 2-3 (patronage, gender, colonialism) and apply rigorously
- "-isms reaction chain": Romantic reacts to Neoclassical, Realist to Romantic, Cubist to perspective, Dada to WWI

### AP Spanish/French Language
- Subjunctive presence is the 4-to-5 barrier
- Pre-loaded country toolkit (Mexico/Spain/Argentina/Colombia for Spanish; France/Québec/Sénégal/Maroc for French) ensures Cultural Comparison material regardless of prompt
- Power Phrases bank for sounding 5-level
- Fill every speaking second; silence = lost points

### APUSH / World / Euro
- Tag every claim with one of the 7 themes (NAT-WXT-GEO-MIG-PCE-WOR-ARC for APUSH)
- Reconstruction-as-unfinished-revolution thesis works for any APUSH Reconstruction prompt
- 12 turning-point dates (1517, 1648, 1789, 1815, 1848, 1871, 1914, 1945, 1989) cover every Euro LEQ context need

### AP Gov
- 9 documents + 15 cases by name + clause + holding
- Q3 SCOTUS Comparison: identify the clause first, match to required case using same clause
- Q4 Argument: hit each rubric point EXPLICITLY (don't bury in vague prose)

### AP English Lang
- Identify SOAPSTone in first 3 minutes from headnote + opening paragraph
- 5 thesis identifies a TENSION or LAYERED move (seemingly X, actually Y)
- Q1 Synthesis: sources should INTERACT with each other ("Source A's optimism is undercut by Source C's data")

---

## SECTION 12 — PEDAGOGICAL PRINCIPLES

The teaching philosophy that runs through every guide.

### 1. Don't shame the 3-target student
The multi-tier system explicitly says "Targeting a 3 → study [3] only items." This is a feature. A student going for a 3 should never feel guilty about skipping [4] and [5] content.

### 2. Make the rubric visible
Students lose points because they don't know what rubrics reward. Every guide explicitly states the rubric with point values, so students can OPTIMIZE for points, not just demonstrate knowledge.

### 3. Templates over creativity
For students under exam time pressure, a templated answer that hits all rubric points beats a creative answer that misses two. Teach templates; cleverness is for stronger students who already nail templates.

### 4. Specific evidence is non-negotiable
Whether it's named historical events, named cases, specific quotes, named cultural traditions, or named formulas — specificity is the universal currency of AP scoring.

### 5. Acknowledge time pressure
AP exams are ALL fast. Most guides include explicit time strategy: "60 min for 80 MCQ = 45 sec each" or "Skip + flag any Q taking >60 sec." Students need permission to move on.

### 6. Memorization has a place
For some exams (AP Gov's 9 docs + 15 cases, Art History's 250 works, Music Theory's intervals + key signatures, language verb conjugations), there's no shortcut. Be honest about it.

### 7. Connect macro to micro / abstract to concrete
Every concept earns deeper credit when connected across levels. Macro behavior to particle (Chem). Visual evidence to cultural context (Art History). Statistical conclusion to scenario (Stats). Force diagram to law cited by name (Physics).

### 8. The "If you do nothing else" rule
Each guide ends with one italicized sentence the student carries into the exam. It's a focus mechanism for last-minute study and for exam-anxiety mitigation.

---

## SECTION 13 — WORKFLOW & PRODUCTION PATTERNS

How to actually build a guide efficiently.

### Step-by-step build process

1. **Identify category** (lab science / math / history / language / etc.) → determines structure pattern
2. **Pick the differentiator** — the one signature feature this guide leads with
3. **Sketch 10 pages** — what content goes on each, what differentiator-page is centerpiece
4. **Copy the helper template** from the most recent similar-category guide (~95% reusable)
5. **Adjust color object** (`C`) for subject's primary color and page colors
6. **Write content top-down**: Page 1 (Math + units + diff preview) → Pages 2-8 (content) → Page 9 (FRQ) → Page 10 (Score Ladder + checklists + One Thing)
7. **Build & check pages**: `node build_X.js && soffice --convert-to pdf && pdfinfo | grep Pages`
8. **Compress if over 10 pages** (cell padding → spacing → font size → margins)
9. **Copy to workspace** for delivery
10. **Post link with summary of distinguishing features**

### Production gotchas (learned the hard way)

- **File truncation when writing very long files** — always verify file ends with `Packer.toBuffer(...)` block. If truncated, append closing blocks via `cat >> file << 'EOF' ... EOF`.
- **Missing `formulaBox` or `codeBox` definitions** — these are NOT in the original helper set; must be added per-file. Common error.
- **Cambria Math font issues** — render "p" as "Þ". Use Consolas everywhere for code/formulas.
- **Page-count creep** — initial AP Bio rendered 19 pages; iteratively compressed to 10. Recipe: cell padding 12→10, spacing 22→18, font size 16→15 in some tables, margins 1000→520.
- **Helper-naming collisions during merging** — "hack", "remember", "decide", "sign" are reserved-feeling. When combining docs, prefix renames (`tHack_fn`, `Tc` namespace).
- **APUSH typo accidentally appears in non-APUSH docs** — always edit-pass for cross-subject contamination.
- **Lemniscate sqrt warning** — harmless (NaN for gaps).
- **Don't redo guides you've already done** — user pushed back when AP Chem/Gov/APUSH/Lang were redone after kid-specific versions existed. Audit library before each batch.
- **AP Spanish was already done** — user correctly called this out. Always audit.

### File organization

- Build scripts: `outputs/build_<subject>.js`
- Output docx: `outputs/AP_<Subject>_Universal_Study_Guide.docx`
- Final delivery: `<workspace>/AP_<Subject>_Universal_Study_Guide.docx`
- Brain file: `<workspace>/AP_Study_Guide_Brain_File.md` (this document)

### Naming conventions
- File names use underscores, no spaces
- Title case for subjects (AP_US_History, AP_English_Language_Composition)
- "Universal_Study_Guide" suffix for client/universal versions
- Kid-specific versions: include score target (AP_Chemistry_5_Target_Study_Guide)

---

## SECTION 14 — LESSONS LEARNED (META)

### What works
- **10-page format** — feels comprehensive but not overwhelming. Below 8 = thin. Above 12 = won't actually be read.
- **Multi-tier badging** — the system that students respond to most. Single biggest improvement to UX.
- **Subject-specific differentiator** — the thing students remember 6 months later.
- **Score Ladder + Tier Checklists at end** — students screenshot/photo this page for night-before review.
- **The "One Thing" sentence** — italic, bold, centered. Surprisingly effective as anchor.

### What doesn't work
- **Overly cute mnemonics** that students won't actually use under pressure
- **Generic motivational content** — students don't need pep talks; they need rubrics
- **Too many examples** — pick 1-2 canonical examples per concept, not 5
- **Image-heavy guides** — most subjects don't need them; Polar Plot for Precalc was the exception. Word-only with formulaBox/codeBox renders cleaner and is more portable.

### What I should have done earlier
- **Audit library before each batch** — would have caught Spanish duplication faster
- **Cap the differentiator** to ONE per guide — sometimes packed 2 (e.g., Macro had 5 graphs AND money-market vs loanable funds; both shipped, but one would have been cleaner)
- **Standardize the closing line** — "If you do nothing else..." is best as one sentence; some guides have two (deviating from pattern)

### Common user feedback patterns
- "Stop autopilot mode" — means: be more thoughtful, less template-grinding, lean into subject differentiation
- "Don't repeat" — audit before building
- "Make it tier-aware" — THE big shift from kid-specific → universal
- "Keep it short" — 10 pages is the contract; honor it

---

## SECTION 15 — THE COMPLETE LIBRARY INDEX

### Universal multi-tier guides (26 total)

**Sciences:**
- AP Biology
- AP Chemistry
- AP Environmental Science
- AP Physics 1 (algebra-based)
- AP Physics 2 (algebra-based, fluids/thermo/E&M/optics/modern)
- AP Physics C: Mechanics (calculus-based)
- AP Physics C: Electricity & Magnetism (calculus-based)

**Math:**
- AP Calculus AB
- AP Calculus BC
- AP Statistics

**Computer Science:**
- AP Computer Science Principles
- AP Computer Science A (Java)

**Economics:**
- AP Macroeconomics
- AP Microeconomics

**History/Social Studies:**
- AP US History (APUSH)
- AP World History: Modern
- AP European History
- AP US Government & Politics
- AP Human Geography
- AP Psychology

**English:**
- AP English Language & Composition
- AP English Literature & Composition

**Languages:**
- AP Spanish Language & Culture
- AP French Language & Culture

**Arts:**
- AP Music Theory
- AP Art History

### Kid-specific guides (earlier work)
- AP Chemistry (5 target)
- APUSH (4 target)
- AP Physics 1 (4 target — son version + daughter version)
- AP US Government (5 target — daughter)
- AP English Lang & Comp (5 target — son)
- AP Precalculus (5 target — son)
- AP Macroeconomics (5 target — daughter)
- AP Statistics (4-5 target — daughter)

### Specialized files
- Combined documents: AP Chem (study + traps), APUSH (study + traps), AP Physics 1 (study + traps for both kids)
- Teaching guides: VSEPR/Resonance review (AP Chem unit 2), Polar Functions teaching guide (AP Precalc, with matplotlib visuals)
- This brain file (`AP_Study_Guide_Brain_File.md`)

### Exams NOT covered (and why)
- **AP Italian, German, Japanese** — too niche (3-5K test-takers each)
- **AP Chinese** — could add (~10K test-takers); character-based, distinct methodology
- **AP Latin** — could add (~6K); translation-heavy
- **AP Spanish Literature** — could add (~30K); literary analysis, different from Spanish Language
- **AP African American Studies** — could add; newest exam (2024+), growing
- **AP Seminar / Research** — Capstone exams; portfolio + presentation format, different template
- **AP Drawing / 2-D Art / 3-D Art** — portfolio submissions, no traditional exam to study for

---

## SECTION 16 — QUICK-REFERENCE CHEAT TABLES

### "What's the differentiator I should lead with?"

| If exam has... | Differentiator pattern |
|---|---|
| DBQ format | Periods/themes table + HIPP sourcing example |
| Required documents/cases | Required-knowledge reference page (AP Gov style) |
| Required works/canon | Visual analysis vocab + canon table (Art History) |
| Heavy graphing | Master graphs page with shift-direction tables |
| Heavy integration | Master integral patterns page |
| Heavy memorization (vocab/forms) | Master reference table by category |
| Performance/recording | 30-day prep plan + technique walkthrough |
| Proficiency / production | Theme + mode framework + power phrases bank |

### "What's the universal closing 'One Thing'?"

| Subject category | "One Thing" pattern |
|---|---|
| Sciences | Show work, units, sig figs; specific reasoning chain |
| Math | Show fundamental equation before manipulating; carry symbols |
| History | Argue with named specifics — names, dates, laws |
| Languages | Produce accurately and fluently; never English |
| Composition | Analyze, don't summarize |
| Visual analysis | Visual evidence → interpretation → context |
| Music | Tonal anchoring — think in scale degrees |
| Computer Science | Trace tables; exact compilable code |

### "What's the [3]/[4]/[5] tagging rule?"

- **[3]** = foundational. A 3-target student needs this. Definitions, central formulas, identity of major concepts.
- **[4]** = next layer. Conditions, complications, secondary patterns, named tactics.
- **[5]** = sophisticated edge. Counter-arguments, nuance, advanced applications, limit cases, framework critiques.

When in doubt, ask: would skipping this concept prevent a 3? Then [3]. Prevent a 4? Then [4]. Prevent a 5? Then [5].

---

## SECTION 17 — INVOCATION FOR NEW THREADS

When loading this file into a fresh Wayfinder/Claude thread, follow with: "Use this AP Study Guide Brain File as the design context for any AP exam study guide work. Default to the universal multi-tier methodology unless a kid-specific score-target version is requested. Always audit the library before building to avoid duplicates."

---

*End of brain file. Last comprehensive update reflects 26 universal guides + earlier kid-specific guides. The library is essentially complete for traditional-exam APs. Future additions (AP Seminar, AP Spanish Literature, AP Latin, AP African American Studies) would need template adjustments for their unique formats.*
