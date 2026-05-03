# AP Exam Study Guide Brain File

**Purpose.** This is a context-loading document for any Claude session continuing work on AP exam study guides for the Wayfinder website. It captures the full design system, per-exam strategic insights, code patterns, pedagogical principles, and iteration workflow developed over 17+ guides built across one long thread.

**Read this top-to-bottom before generating any new guide.** It will let you hit the ground running with established patterns rather than rediscovering them.

---

## 1. THE THREE DOC TYPES (recognize which one is being asked for)

There are exactly three categories. Identify which one before designing.

### A. The Comprehensive Study Guide (review / reference)
- **Audience:** student preparing for the exam, has seen the material once
- **Purpose:** dense reference covering all units + exam strategy
- **Page count:** 8–11 pages typical
- **Tone:** dense bullet points, formula boxes, comparison tables
- **Structure:** Math-of-a-score → Master strip → Unit-by-unit pages → FRQ strategy → Final tips
- **Examples in thread:** AP Chem (8 pp), APUSH (10 pp), AP Physics 1 (10 pp), AP Gov (9 pp), AP Lang (7 pp), AP Macro (11 pp), AP Stats (13 pp), AP Precalc (8 pp)

### B. The Traps & Hacks Playbook (score-optimization)
- **Audience:** student who knows the material but wants to maximize score
- **Purpose:** operational, not informational — every line is "do this/avoid that"
- **Page count:** 3 pages typical (must stay tight)
- **Tone:** numbered traps + tier-tagged hacks
- **Structure:** Math-of-the-target → Traps by unit → Hacks/decision-trees → FRQ scoring decoder
- **Examples in thread:** AP Chem (3 pp), APUSH (3 pp), AP Physics 1 (3 pp)

### C. The Teaching Guide (teach-from-scratch)
- **Audience:** student who didn't fully cover the topic in class
- **Purpose:** build understanding from first principles
- **Page count:** 5–10 pages typical
- **Tone:** long-form articulate prose + lots of visuals + worked examples + practice problems
- **Structure:** Big idea → mechanism → visual catalog → analysis → worked examples
- **Examples in thread:** Polar Functions for AP Precalc (6 pp), VSEPR + Resonance for AP Chem (10 pp)

**Combined docs (A + B):** sometimes the user asks to merge the comprehensive guide with the traps doc into one. Use a "PART II" transition page banner. See section 7 for merge mechanics.

---

## 2. PER-EXAM STRATEGIC INSIGHTS (the unique 5-vs-4 differentiator for each)

Every AP exam has ONE central insight that distinguishes 5-scorers from 4-scorers. Internalize these — they drive the doc's framing.

### AP Chemistry
- **Math of a 5:** ~75% total. MCQ ~45/60, FRQ ~80% on each
- **THE differentiator: particulate-level reasoning.** Every "why" answer must cite a principle (Coulomb's law / IMF / Q vs K / Le Châtelier) AND apply it to atomic-level mechanism
- **Top traps:** mass-spec answer ≠ tallest peak (it's weighted average); Cu/Cr exceptions; cation removal from highest n first; bond energies BROKEN minus FORMED; only first-order has constant t½; ΔH(kJ) vs ΔS(J/K) unit conversion; E°cell doesn't scale with stoichiometry
- **Big themes:** Coulombic interactions / IMFs determine bulk properties / particulate reasoning / Q vs K predicts direction / ΔG° unifies thermo+equilibrium+electrochem / bonded vs nonbonded e⁻ pairs control geometry
- **Memorization fuel:** 7 strong acids; spontaneity sign table; integrated rate law shapes; Henderson-Hasselbalch; ΔG° = −RT ln K = −nFE°cell

### AP US History (APUSH)
- **Math of a 4 (target was 4):** ~62%. MCQ 35/55; SAQ 6/9; DBQ 4/7; LEQ 4/6
- **Math of a 5:** ~75%. MCQ 42+/55; SAQ 7-8/9; DBQ 6/7; LEQ 5-6/6
- **THE differentiator: SPECIFICITY wins.** "The reformers worked hard" earns 0; "Jane Addams founded Hull House in Chicago in 1889" earns the point
- **9 periods, 7 themes (NAT/MIG/GEO/WXT/PCE/ASO/IDE)**
- **DBQ rubric:** Thesis (1) + Context (1) + 3 docs (1) + Outside evidence (1) [floor=4 pts] | + 6 docs (1) + HIPP for 3 docs (1) + Complexity (1) [stretch=7 pts]
- **LEQ rubric:** 6 pts; same DNA as DBQ but no docs — need 2 specific examples + reasoning + complexity
- **Universal Evidence Bank:** 7-8 events that work for almost any prompt — Revolution, Constitution, Civil War/Reconstruction, Industrialization, Progressive Era, New Deal, WWII, Civil Rights Movement
- **SAQ ABC method:** Part A = state directly; Part B = specific year/event/explain; Part C = different example
- **HIPP for sourcing:** Historical situation, Intended audience, Purpose, Point of view (pick easiest 3 of 7 docs)

### AP Physics 1
- **Math of a 4:** MCQ ~27 + complete every FRQ; **Math of a 5:** MCQ ~33 + commentary depth
- **THE differentiator: drawing the right diagram + showing symbolic algebra before numbers.** A correct numerical answer with no work shown often earns only 1 of 3 points
- **The PSM (Problem-Solving Method):** READ → DRAW (FBD/motion/energy bar/before-after) → LIST knowns + sign convention → PICK weapon → SOLVE symbolically → CHECK
- **Pick Your Weapon decision tree:** speed at time → kinematics; speed at position → energy; force at instant → F=ma; after collision → momentum; brief impact → impulse; circular path → centripetal; restoring force → SHM
- **Free Points Routine:** first 60 seconds, write all kinematic + force + energy + momentum + SHM + fluid equations on scratch margin
- **Lab linearization tricks:** d vs t² → slope = g/2; T² vs L → 4π²/g; T² vs m → 4π²/k; F vs x → k

### AP Government & Politics
- **Math of a 5:** ~75%. MCQ 41/55; FRQ scaled
- **THE differentiator: knowing the CONSTITUTIONAL CLAUSE behind each required SCOTUS case.** SCOTUS Comparison FRQ asks you to match a non-required case to a required one via the shared clause
- **Memorization is the highest-leverage prep:** 9 foundational documents + 15 SCOTUS cases
- **9 foundational docs:** Declaration, Articles, Constitution, Federalist 10/51/70/78, Brutus 1, Letter from Birmingham Jail
- **15 cases:** Marbury, McCulloch, US v. Lopez, Engel v. Vitale, Wisconsin v. Yoder, Tinker, NYT v. US, Schenck, Gideon, Roe, McDonald, Brown, Citizens United, Baker v. Carr, Shaw v. Reno
- **5 Big Ideas:** CON (Constitutionalism), LOR (Liberty + Order), PRD (Civic Participation), PMI (Policy-Making Interests), MPA (Methods of Political Analysis)
- **4 FRQ types are FIXED:** Concept Application (3 pts) → Quantitative Analysis (4 pts) → SCOTUS Comparison (4 pts) → Argument Essay (6 pts, must cite a foundational doc)

### AP English Language & Composition
- **Math of a 5:** ~75%. MCQ 33+/45 + ~5/6 average on essays
- **Universal Rubric (same on all 3 essays):** Thesis (1) + Evidence+Commentary (0-4 single scale) + Sophistication (1)
  - 3/4 on E+C = 4-zone (specific evidence + commentary explaining HOW)
  - 4/4 on E+C = 5-zone (sophisticated commentary explaining COMPLEXITY)
- **THE differentiator: commentary depth.** A 4-scorer IDENTIFIES devices; a 5-scorer EXPLAINS HOW devices CREATE meaning + argument
- **Body paragraph formula for Rhetorical Analysis:** TOPIC SENTENCE (device + connection to argument) → EVIDENCE (brief quote) → COMMENTARY (this is where you score — explain HOW it works) → CONNECTION TO PURPOSE
- **3 essays:** Synthesis (cite 4-5 sources, weave them, take a position), Rhetorical Analysis (device→effect→purpose), Argument (defend/challenge/**qualify** — qualify is best for sophistication)
- **The 4 paths to the Sophistication point:** (1) nuanced argument acknowledging complexity (2) implications/limits (3) style — your own writing demonstrates rhetorical skill (4) broader context

### AP Precalculus
- **Math of a 5:** ~75%. MCQ Part A (no calc) 21/28; Part B (calc) 9/12; FRQs ~80%
- **THE differentiator: SHOW WORK + INTERPRET.** Even when calculator gives the answer, write the formula symbolically first, then interpret in context
- **The 4 FRQ types are FIXED every year:**
  - FRQ 1: Function Concepts (calculator)
  - FRQ 2: Modeling Non-Periodic (calculator) — recognize family from data: constant differences=linear; constant ratios=exponential; constant 2nd diff=quadratic
  - FRQ 3: Modeling Periodic (no calculator) — sinusoidal 5-step recipe
  - FRQ 4: Symbolic Manipulations (no calculator) — algebra-heavy, show every step
- **Sinusoidal 5-step recipe:** find midline (max+min)/2 → amplitude (max−min)/2 → b = 2π/period → choose sin/cos based on starting position → find phase shift h
- **Critical mode setting:** RADIAN mode for trig (default for AP)
- **Unit circle memorization is non-negotiable** for no-calc sections

### AP Macroeconomics
- **Math of a 5:** ~75%. MCQ 45/60; FRQ ~80%
- **THE differentiator: CHAIN OF REASONING.** Every Macro FRQ rewards a connected sequence: "action → market effect → interest rate → spending → AD/AS → real GDP/P/U." 4-scorer stops at 1-2 links; 5-scorer chains 4-6 links and ends at the asked-for variable
- **The 7 master graphs:** PPC, Business Cycle, AD-AS, Money Market, Loanable Funds, Phillips Curve, FOREX
- **Money Market vs Loanable Funds is the #1 confused topic:**
  - MM: Y-axis = NOMINAL interest rate; supply is vertical (Fed sets MS); for monetary policy
  - LF: Y-axis = REAL interest rate; supply slopes up (saving); for gov deficit/crowding out
- **Crowding out chain:** gov deficit → DLF right → real i ↑ → private investment ↓ → slower long-run growth
- **Universal chain template:** Action → Direct Market Effect → Interest Rate or Wage Effect → Spending Component → AD or AS Shift → Real GDP, P, U Outcome

### AP Statistics
- **Math of a 5:** ~75%. MCQ 30/40; FRQs scored 0-4 each, aim for 3s and 4s
- **THE differentiator: STATE → PLAN → DO → CONCLUDE framework executed in CONTEXT.** Generic answers earn no points; every parameter, hypothesis, condition, conclusion must reference SPECIFIC people/things in the problem with SPECIFIC measurement and units
- **The 4-step framework:**
  - STATE: define parameter in context, hypotheses, α
  - PLAN: name procedure, check ALL conditions explicitly (random + 10% + Normal/Large or large counts)
  - DO: show formula, substituted values, test stat, p-value/df
  - CONCLUDE: decision + context + name original variable
- **CI interpretation (gold-standard wording):** "We are X% confident that the true [parameter, in context, in units] is between [low] and [high]"
- **P-value interpretation:** "Assuming H₀ true, probability of observing data this extreme or more is [p-value]"
- **Top traps:** confusing MM with LF (other AP exam too); CI misinterpretation ("95% chance"); random sampling vs random assignment; pooled vs unpooled SE (test uses pooled, CI uses unpooled for 2-prop)

---

## 3. THE DESIGN SYSTEM (visual + code patterns refined across all guides)

### 3a. Page setup (US Letter)
```
size: { width: 12240, height: 15840 }   // DXA units
margin: { top: 520-720, right: 1000-1080, bottom: 480-720, left: 1000-1080 }
```

### 3b. Color palette (consistent across all guides)
- **Master/Primary (deep navy):** `1A237E`
- **Blue (units, MCQ, info):** `1565C0`
- **Red (forces, urgent, AD-AS):** `C62828`
- **Orange (energy, gilded, antebellum):** `EF6C00`
- **Purple (momentum, longrun):** `6A1B9A`
- **Green (energy, sophistication, env):** `2E7D32`
- **Teal (rotation, financial, philosophy):** `00838F` or `00695C`
- **Maroon/Pink (RA essay, FRQ, civil war):** `8E1538` or `C2185B`
- **Slate (final/traps page):** `455A64`
- **Brown (basics, colonial):** `5D4037`

### 3c. Standard color slots in C constant (color-by-page)
```js
const C = {
  rowAlt: "F4F6FA", rowHead: "E8EAF6",
  page1: "1A237E",   // master
  page2: "1565C0",   // blue
  // ... per-unit colors
  formula: "E8F1FB", formulaBorder: "1565C0",
  insight: "E1F5FE", insightBorder: "0288D1", insightText: "01579B",
  warn: "FFF8E1", warnBorder: "F9A825", warnText: "B8860B",
  practice: "F1F8E9", practiceBorder: "689F38", practiceText: "33691E",
  t4Text: "1B5E20", t5Text: "B8860B",  // tier badge text colors
};
```

### 3d. Font sizes (all in half-points, so 16 = 8pt)
- **Body text:** 16 (8pt) for review/playbook docs; 18 (9pt) for teaching docs
- **Headings:** 18 (9pt) for sub-section heads; 22-24 (11-12pt) for big banner titles
- **Footer/header:** 16 (8pt) gray italic
- **Formula box (Consolas):** 17-19
- **Tier badge:** 13 (small)

### 3e. Tier badges system (for "playbook" docs targeting a specific score)
The parseInline function detects `[4]` and `[5]` markers and renders them as colored highlighted badges:
- `[4]` → `[FLOOR—4]` in green text on green highlight (#1B5E20 / 'green')
- `[5]` → `[STRETCH—5]` in gold text on yellow highlight (#B8860B / 'yellow')

Use `[4]` to mark "must do for the floor score" and `[5]` to mark "what pushes you to the stretch score."

### 3f. Callout types (each is a small table with colored left border)
| Callout | Use for | Fill / Border / Text colors |
|---|---|---|
| **KEY INSIGHT** (insight) | conceptual aha moments | E1F5FE / 0288D1 / 01579B |
| **AP TRAP** (trap/warning) | specific errors that lose points | FFF3CD / F1C232 / 8B6F00 |
| **MEMORY HACK** (hack) | mnemonics, shortcuts | E1F5FE / 0288D1 / 01579B |
| **REMEMBER 3** (remember) | three takeaways | F1F8E9 / 689F38 / 33691E |
| **DECIDE** (decide) | decision tree | F3E5F5 / 8E24AA / 4A148C |
| **SIGN CHECK** (sign) | physics-specific signs | FFEBEE / C62828 / B71C1C |
| **WATCH OUT** (warning) | gentler warnings | FFF8E1 / F9A825 / B8860B |
| **PRACTICE** | practice problem | F1F8E9 / 689F38 / 33691E |
| **MASTER FRAME** (epic closer) | meta-level summary at end | FCE4EC / C2185B / 880E4F |

### 3g. Standard page structure
1. **Title block** (centered, 30pt name + 17pt subtitle italic + horizontal rule border)
2. **Tag legend** (if using tier badges) — center-aligned
3. **bigBanner** (full-width colored banner with "PAGE N | TITLE" white text)
4. **sectionHead** (left-aligned bold colored text with bottom border)
5. **plainPara** for prose, **bullet** for lists, **dataTable** for comparisons, **formulaBox** for equations
6. **callouts** sprinkled throughout
7. **closing italic line** ("If you do nothing else: ... That's how you get the [score].")

---

## 4. CODE PATTERNS (docx-js)

### 4a. The skeleton script structure
Every build script follows this template. Save time by copying an existing one (e.g., `build_apgov.js` or `build_apstat.js`) as the starting point.

```js
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, LevelFormat, BorderStyle, WidthType, ShadingType,
        PageBreak, PageNumber, Header, Footer, ImageRun } = require('docx');

const C = { /* color constants */ };
const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
const cellBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

function tx(text, opts = {}) { return new TextRun({ text, ...opts }); }
function parseInline(text, baseOpts) { /* handles **bold**, _italic_, `code`, [4], [5] */ }
function plainPara(text, opts, paraOpts) { /* regular paragraph */ }
function bullet(text) { /* bulleted item */ }
function bigBanner(label, title, color) { /* full-width banner */ }
function sectionHead(text, color) { /* underlined section */ }
function formulaBox(lines, color) { /* monospace equations in box */ }
function callout(text, label, fill, border, textColor) { /* colored callout */ }
function dataTable(columnWidths, headerCells, bodyRows) { /* comparison table */ }
function image(filename, width, height) { /* embedded image */ }
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

const content = [];
// ... push all paragraphs, tables, images ...

const doc = new Document({
  styles: { default: { document: { run: { font: "Calibri", size: 16 } } } },
  numbering: { config: [{ reference: "bullets", levels: [{ ... }] }] },
  sections: [{
    properties: { page: { size: ..., margin: ... } },
    headers: { default: new Header({ ... }) },
    footers: { default: new Footer({ ... }) },
    children: content,
  }],
});

Packer.toBuffer(doc).then(buf => fs.writeFileSync(out, buf));
```

### 4b. The parseInline function (with tier badges)
This is the universal text formatter. It supports `**bold**`, `_italic_`, `` `code` ``, `[4]`, `[5]`:

```js
function parseInline(text, baseOpts = { size: 16 }) {
  if (typeof text !== 'string') return [tx(String(text), baseOpts)];
  const runs = [];
  const re = /(\*\*[^*]+\*\*|_[^_]+_|`[^`]+`|\[4\]|\[5\])/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) runs.push(tx(text.slice(last, m.index), baseOpts));
    const seg = m[0];
    if (seg === '[4]') runs.push(tx(' [FLOOR—4] ', { ...baseOpts, bold: true, size: 13, color: "1B5E20", highlight: 'green' }));
    else if (seg === '[5]') runs.push(tx(' [STRETCH—5] ', { ...baseOpts, bold: true, size: 13, color: "B8860B", highlight: 'yellow' }));
    else if (seg.startsWith('**')) runs.push(tx(seg.slice(2, -2), { ...baseOpts, bold: true }));
    else if (seg.startsWith('_')) runs.push(tx(seg.slice(1, -1), { ...baseOpts, italics: true }));
    else runs.push(tx(seg.slice(1, -1), { ...baseOpts, font: "Consolas" }));
    last = m.index + seg.length;
  }
  if (last < text.length) runs.push(tx(text.slice(last), baseOpts));
  if (!runs.length) runs.push(tx(text, baseOpts));
  return runs;
}
```

### 4c. Critical docx-js quirks (from skill notes)
- **Always set page size explicitly** — docx-js defaults to A4, NOT US Letter
- **Use ShadingType.CLEAR not SOLID** — SOLID renders as black background
- **Tables need both columnWidths AND cell width set** to same DXA values
- **Use WidthType.DXA, never WidthType.PERCENTAGE** (breaks in Google Docs)
- **PageBreak must be inside a Paragraph:** `new Paragraph({ children: [new PageBreak()] })`
- **ImageRun requires `type` property:** `'png'`, `'jpg'`, etc.
- **ImageRun requires `altText` with title/description/name** (all 3)
- **Smart quotes** use XML entities for editing existing docs

### 4d. Common bugs I've hit
1. **Unclosed `**bold**` markers** in plainPara — renders as literal asterisks. Always pair them.
2. **Font rendering of "p" as "Þ"** with Cambria Math — use Consolas instead
3. **NUL bytes from sed/Edit** — strip with `tr -d '\000'`
4. **`hack`/`remember`/`decide`/`sign` already declared** when merging docs — rename traps-content's helpers with `t` prefix
5. **`pageBreak` not defined** — some doc helpers were missing; ensure `const pageBreak = () => ...` is there
6. **`plainPara` not defined when merging** — some study guides use `plainText`; add a shim
7. **Table header repeats on next page** when content overflows — usually fine but can cause "orphan header" pages

---

## 5. VISUAL GENERATION (matplotlib for embedded images)

### 5a. When to embed real visuals
- **Teaching docs:** essential — visuals are 50%+ of pedagogical value
- **Comprehensive guides:** sparingly — only for foundational concepts (normal distribution, CLT, key graph anatomies)
- **Playbook docs:** rarely — keep them tight and operational

### 5b. matplotlib helpers I've built
- **Polar plots** (cardioid, rose curves, lemniscate, spiral, circle) — see `generate_polar_images.py`
- **Statistical distributions** (normal with empirical rule, skewed histograms, CLT panels, Type I/II errors, boxplot anatomy) — see `generate_stats_images.py`
- **Molecular geometries** (custom 2D drawings of atoms+bonds+lone pairs) — see `generate_chem_images.py`

### 5c. Visual generation principles
- **DPI 130 with bbox_inches='tight'** for crisp images at typical embed sizes (200-560 width)
- **Use the doc's color palette** in matplotlib (1565C0 blue, C62828 red, 2E7D32 green, etc.)
- **Title in #1A237E navy bold** for consistency with doc primary color
- **Light gray gridlines (#cccccc)** to avoid visual noise
- **Always save to a subfolder** like `polar_imgs/`, `stats_imgs/`, `chem_imgs/`
- **For molecular structures:** use `Circle` patches for atoms with element-color fills, `plot()` for bonds (single/double/triple via offset perpendiculars), small dots for lone pairs at angles

### 5d. Image embed sizes (typical)
- Single full-width image: 480-560 width × 200-280 height
- Side-by-side pair: 230-240 each in a 2-column borderless table
- Coordinate diagrams: 320-360 square
- Big gallery (12+ shapes): 600 wide × 440 height

---

## 6. CONTENT PATTERNS THAT CONSISTENTLY WORK

### 6a. The "Math of a Score" table (always page 1)
Build confidence by showing the score breakdown:
| Section | Weight | Total Available | Get this many | What that takes |

This makes "75%" or "60%" feel achievable instead of abstract.

### 6b. The "Universal Vocabulary" or "Master Strip"
For knowledge-heavy exams, dedicate a page (or top of page 1) to the 25-35 high-frequency terms with definitions. APUSH has period anchors + presidents/SCOTUS/wars; AP Stats has 28 terms; AP Macro has 30+ terms.

### 6c. The "X-vs-Y Ladder" comparison table (always toward end)
Side-by-side concrete sentence-level comparisons of what a 4-scorer writes vs what a 5-scorer writes. THIS IS THE SINGLE MOST EFFECTIVE PATTERN. It makes the abstract "more sophistication" requirement concrete.

### 6d. The "Phrases That Score" section
List the exact rubric-pleasing phrases by topic. Drop these phrases into FRQs. Examples:
- "We are X% confident that the true [parameter] is between [low] and [high]" (Stats)
- "Federalist 51 argues that 'ambition must be made to counteract ambition'" (Gov)
- "By foregrounding specific bodily details — the cracked walls — the author bypasses statistical abstraction" (Lang)

### 6e. The "Test-Day Execution Checklist"
Split into floor and stretch:
- **For a 4 — bag ALL of these:** ✓ ... ✓ ...
- **For a 5 — add these on top:** ✓ ...

### 6f. The "If you do nothing else" closing line
Always close the doc with an italic centered paragraph naming the 2-3 highest-leverage moves. Examples:
- *"If you do nothing else: master the STATE-PLAN-DO-CONCLUDE framework and apply it with full context. That's how you get the 5."*
- *"If you do nothing else: bag the math of a 4, nail the templates, and pull from the Evidence Bank. That's your 4."*

### 6g. The "Worked Example" structure
For teaching docs and harder topics, include explicit worked examples:
1. **Setup line** — restate the problem
2. **Step-by-step labeled steps** — show every reasoning step
3. **Final answer** — boxed or bolded
4. **Context interpretation** — connect back to original

### 6h. The "Common Traps" or "Top N Traps" section
Numbered, with bold lead-in. Each trap = one specific error pattern. The Math of a 4 doc had 8 MCQ trap patterns; AP Macro had 15. Tag each as `[4]` or `[5]` based on which tier slips on it.

---

## 7. FILE/DOC ORGANIZATION + WORKFLOW

### 7a. Standard file naming
- `build_<subject>.js` — the build script for the comprehensive guide
- `build_<subject>_traps.js` — the build script for the playbook
- `build_<subject>_combined.js` — merged version (if requested)
- `<Subject>_Study_Guide.docx` — final delivered file
- `generate_<topic>_images.py` — image generator (if visuals needed)
- `<topic>_imgs/` — folder for generated PNGs

### 7b. Workflow for each new doc
1. Read this brain file (you're doing it now)
2. Identify which doc type (review / playbook / teaching)
3. If similar exam exists, copy that build script as starting point
4. Plan page structure with content per page mapped out
5. If visuals needed, write matplotlib generator first → run → verify
6. Write the build_*.js
7. Run via Node, validate via `python3 validate.py`, convert to PDF
8. View PDF page-by-page via pdftoppm + Read tool
9. Iterate to compress to target page count
10. Copy final docx to user's workspace folder via `cp` + present link

### 7c. Bash patterns I've used
```bash
# Build + convert + check pages
node build_X.js "OUT.docx" && python3 [skill]/scripts/office/soffice.py \
  --headless --convert-to pdf OUT.docx --outdir /tmp 2>&1 | tail -1 && \
  pdfinfo /tmp/OUT.pdf | grep -i pages

# Render PDF pages to JPGs for visual verification
rm -f /tmp/preview-*.jpg && pdftoppm -jpeg -r 90 /tmp/OUT.pdf /tmp/preview && \
  cp /tmp/preview-N.jpg local_pageN.jpg

# Validate docx
python3 [skill]/scripts/office/validate.py OUT.docx

# Copy to user's folder for delivery
cp OUT.docx "[user-folder]/OUT.docx"
```

### 7d. Merging two docs into one
Use the Python merge script pattern (`merge_apdocs.py`). Key insight: take study guide as the BASE (it has all helpers), inject the traps-specific helpers as a patch, rename collisions (traps' `bigBanner` → `bigBanner_t`, `trap` → `tTrap_fn`, etc.). See section 4d on bugs to avoid.

---

## 8. ITERATION + COMPRESSION (because docs always overshoot)

### 8a. Standard compression sequence (in order of impact)
1. **Tighten table cell margins** — top/bottom from 22 → 11 → 8; left/right from 100 → 80
2. **Tighten paragraph spacing** — `after` from 60 → 22 → 18; line from 280 → 215 → 213
3. **Tighten section head spacing** — `before: 180/140 → 50/60`
4. **Tighten banner padding** — `top/bottom: 80 → 60 → 50`
5. **Reduce font size** — body 18 → 16 (only as last resort)
6. **Reduce page margins** — `top/bottom: 720 → 600 → 520; left/right: 1080 → 1000`
7. **Combine adjacent rows in tables** — merge two short cells into one
8. **Trim least-essential rows** — remove 1-2 rows that overlap with other rows
9. **Move section earlier** — put symmetry tests BEFORE the big image so they don't push to next page
10. **Combine pages** — if a "page" is mostly empty (just a closer), fold its content into the previous page

### 8b. Page-break sensitivity
- Image embeds add ~1/4 page each — plan accordingly
- Big tables (10+ rows) often span page boundaries — keep them shorter or accept it
- KEY INSIGHT callouts after tables can spill 1-3 lines — move them before the table or compress
- Italic closing lines should fit at the end of the last content page; otherwise they create a dangling "Page N+1 with 3 lines"

### 8c. Visual verification cadence
After each build:
1. Check page count first (pdfinfo)
2. View page 1 (title + first content section quality)
3. View the final page (closer + italic line render correctly)
4. View any page with embedded images
5. Spot-check 1-2 middle pages

---

## 9. PEDAGOGY PRINCIPLES (what makes a doc actually help students)

### 9a. Confidence first, content second
Always lead with "the math of a 5/4" — show the score breakdown so the student SEES that the goal is achievable. Without this, the doc feels like a mountain. With it, they think "I just need to nail X and Y."

### 9b. Specificity wins
"Reformers worked hard" earns 0. "Jane Addams founded Hull House in Chicago in 1889" earns the point. **Every guide has this lesson — drill it explicitly.**

### 9c. Mental models before formulas
Before showing the formula, give the mental model. "As θ rotates around like a clock, r = f(θ) tells you how far OUT to go" before introducing polar plotting. "Action → market → interest rate → spending → AD → output" before drowning in macro graphs.

### 9d. Concrete > abstract
4-vs-5 ladders with sentence-level examples beat abstract rubric explanations every time. The student should be able to point at the 4-scorer column and say "I do that" and at the 5-scorer column and say "I'll start doing that."

### 9e. Decision trees > rules
For complex multi-method topics (Pick Your Weapon in physics; which t-test in stats; which test for chi-square), give a decision tree that maps from problem-recognition to method-selection.

### 9f. Worked examples should show every step
Don't skip steps "for brevity." The student needs to see the reasoning chain. Especially in chem unit conversions, physics symbolic algebra, and stats inference setup.

### 9g. The "if you only do one thing" closer
Every doc ends with an italic centered line naming the 1-3 highest-leverage moves. This is what students remember on test day.

---

## 10. SUBJECT-SPECIFIC GOTCHAS (specific things to remember per exam)

### AP Chem
- 9 Units (College Board organization), but Unit 4 is "Reactions" and they reorganize sometimes — current org: Atomic / Bonding / IMFs / Reactions / Kinetics / Equilibrium / Acids-Bases / Thermo+Electrochem
- Particulate-level reasoning is the secret password
- ΔG° = −RT ln K = −nFE°cell (the thermo trio)

### APUSH
- 9 Periods (1491-Present)
- DBQ requires citing 3 docs minimum, 6 for full credit
- Argument essay must reference foundational documents (similar to AP Gov)
- "States rights to do what?" — Civil War cause = slavery, not states' rights as a generic concept

### AP Physics 1
- Now includes fluids (Unit 8 added in 2024-25 redesign)
- No calculator on Part A MCQ — formula sheet provided
- Lab linearization gets the 5: d vs t² for free fall, T² vs L for pendulum, etc.

### AP Gov
- Argument Essay REQUIRES citing one of the 9 foundational documents (most-missed point)
- SCOTUS Comparison FRQ requires knowing the CLAUSE behind each required case (not just facts)
- 5 Big Ideas (CON/LOR/PRD/PMI/MPA) tag every FRQ

### AP Lang
- Universal rubric: same 6 pts (Thesis 1 + E+C 0-4 + Sophistication 1) on all 3 essays
- Sophistication point ~10% of essays earn it — 4 paths to earn (nuanced argument / implications / style / broader context)
- Argument essay: defend/challenge/QUALIFY (qualify is highest-sophistication ceiling)

### AP Precalc
- Only Units 1-3 tested (Unit 4 parameters/vectors/matrices NOT on exam)
- 4 FRQ types are FIXED every year — preparable specifically
- RADIAN mode on calculator

### AP Macro
- 6 units; Units 3 and 5 are 40-55% combined
- 7 master graphs to know cold
- MM (nominal i) vs LF (real r) is the #1 confused topic
- Chain of reasoning is the FRQ score-defining move

### AP Stats
- 9 Units; Inference for proportions/means is the heart
- 4-step framework (STATE-PLAN-DO-CONCLUDE) is the entire game
- CI interpretation: NOT "95% chance"; CORRECT: "95% of intervals constructed this way capture the parameter"
- Random sampling vs random assignment (sampling generalizes; assignment establishes causation)

---

## 11. THE WAYFINDER MODULE CONTEXT

(This section anticipates the next thread's task: building an AP exam study guide MODULE for the Wayfinder website.)

The user is building an AP exam study guide module — meaning probably a webpage or app feature where students can request/access these guides. Considerations:

- **Each guide is a single self-contained docx** (or PDF). The web module probably needs a way to list/select/download these guides.
- **The guides are not interactive** — they're reference documents.
- **Per-subject, three doc types might exist** (comprehensive / playbook / combined). The module may want to expose all three.
- **Visual previews** — the matplotlib-generated PNGs in the docs are valuable. The module might thumbnail them.
- **Personalization** — if user has a target score (4 or 5), serve the appropriate playbook variant.
- **Updates** — College Board occasionally redesigns exams (AP Physics 1 added fluids in 2024-25; AP Precalc is new since 2024). Build with versioning.

---

## 12. THE LIBRARY OF EXISTING GUIDES (what's been built)

| Subject | Type | Pages | Target | Status |
|---|---|---|---|---|
| AP Chemistry | Comprehensive | 8 | — | ✓ |
| AP Chemistry | Traps & Hacks | 3 | 5 | ✓ |
| AP Chemistry | Combined | 12 | — | ✓ |
| AP US History | Comprehensive | 10 | — | ✓ |
| AP US History | Traps & Hacks | 3 | 4 | ✓ |
| AP US History | Combined | 14 | — | ✓ |
| AP Physics 1 | Comprehensive | 10 | — | ✓ |
| AP Physics 1 | Traps & Hacks | 3 | 4→5 | ✓ |
| AP Physics 1 | Combined | 13 | — | ✓ |
| AP Government | Comprehensive | 9 | 5 | ✓ |
| AP English Lang | Comprehensive | 7 | 5 | ✓ |
| AP Precalculus | Comprehensive | 8 | 5 | ✓ |
| AP Macroeconomics | Comprehensive | 11 | 5 | ✓ |
| AP Statistics | Comprehensive | 13 | 5 | ✓ |
| Polar Functions (Precalc) | Teaching | 6 | — | ✓ (with matplotlib polar plots) |
| AP Chem Unit 2 (VSEPR/Resonance) | Teaching | 10 | — | ✓ (with custom molecular diagrams) |

---

## 13. CHECKLIST FOR NEW DOC GENERATION

Before delivering any new AP study guide, run this mental checklist:

- [ ] Read this brain file fully
- [ ] Identified doc type (comprehensive / playbook / teaching)
- [ ] Identified the central 5-vs-4 differentiator for this exam
- [ ] Math-of-the-target table on page 1
- [ ] Color-coded units / pages with consistent palette
- [ ] At least one matplotlib visual if it's a teaching doc
- [ ] 4-vs-5 ladder with concrete sentence-level comparisons (if playbook)
- [ ] "Phrases That Score" or "Always Say This" section
- [ ] Worked examples for hard topics (with full reasoning shown)
- [ ] Common Traps section (numbered, with bold lead-ins)
- [ ] Test-Day Execution Checklist split into floor/stretch
- [ ] Italic closing line ("If you do nothing else: ...")
- [ ] Page count within target ±1
- [ ] Visual verification of every page (especially first, last, and image-heavy)
- [ ] No orphan pages (final page should have substantive content)
- [ ] No unclosed `**bold**` markers
- [ ] File copied to user's workspace folder
- [ ] Delivery message: link + concise summary of structure

---

## 14. CLOSING NOTE

These guides got progressively better through iteration. Key meta-insights:

1. **Length isn't the value — density and pattern recognition is.** A 6-page playbook with sharp 4-vs-5 ladders beats a 15-page comprehensive guide for score optimization.
2. **Visuals matter most for spatial/geometric topics** (polar, VSEPR, distributions, AD-AS). They matter less for content-heavy topics (APUSH, AP Gov memorization).
3. **The user values speed of delivery + visual quality** — build, validate, render, deliver in one cycle. Don't over-iterate before showing.
4. **Tier badges + the math-of-a-score table is the killer combination** that turns abstract goals into concrete plans.

When generating a new guide, you're not starting from scratch — you have this entire library to draw on. Copy a similar build script, adapt the content, run the workflow. Most of the work is content selection (which 30 vocab terms? which 8 traps? which worked example?), not infrastructure.

**The goal is always: a document that the student opens once, returns to repeatedly, and uses up to (and during) the exam.** Design for that.
