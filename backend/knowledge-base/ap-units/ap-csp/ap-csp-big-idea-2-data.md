# AP Computer Science Principles — Big Idea 2: Data — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this Big Idea. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 17–22% of the AP CSP exam
- **Sub-topics covered:** binary representation; compression; metadata; data abstraction; analyzing data; bias in data; cleaning data.
- **Where this Big Idea appears on the exam:** Binary number conversions tested constantly. Compression types (lossy vs lossless). Data analysis and bias frequent.

## Big Ideas

1. **All data in computers is binary** (0s and 1s).
2. **Compression reduces file size** — lossy (loses information) vs lossless (preserves perfectly).
3. **Metadata** describes other data.
4. **Data analysis** finds patterns, supports decisions.
5. **Data bias** can produce unfair or wrong conclusions.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Binary representation:**
  - **Bit:** 0 or 1.
  - **Byte:** 8 bits.
  - **n bits represent 2^n values.**
  - **Binary number system** (base 2).
  - **Decimal to binary:** divide by 2, track remainders.
  - **Binary to decimal:** sum powers of 2.
- **Common units:**
  - **KB (kilobyte):** ~1,000 bytes.
  - **MB (megabyte):** ~1 million bytes.
  - **GB (gigabyte):** ~1 billion bytes.
  - **TB (terabyte):** ~1 trillion bytes.
- **Representation of data types:**
  - **Numbers:** binary integers; floating-point for decimals.
  - **Text:** ASCII (7-bit, 128 characters); Unicode (much wider, all languages).
  - **Images:** pixels; each pixel has color values (RGB; each 0-255 = 1 byte each).
  - **Audio:** samples per second (sampling rate); bit depth.
  - **Video:** sequence of images + audio.
- **Compression:**
  - **Lossless compression:** preserves all data; reversible. (PNG images, ZIP files, FLAC audio.)
  - **Lossy compression:** loses some data; not reversible; smaller file size. (JPEG images, MP3 audio, MP4 video.)
  - **Trade-off:** smaller file vs perfect quality.
- **Metadata:**
  - **Data about data.**
  - **Examples:** photo metadata (date, location, camera); music metadata (title, artist, album); document metadata (author, edits).
  - Used to **organize, search, analyze**.
  - **Privacy implications:** metadata can reveal much about you.
- **Data abstraction:**
  - **Lists, dictionaries, records** — collections of data.
  - **Variables** abstract memory locations.
  - Higher-level abstractions hide details.
- **Data analysis:**
  - **Data → information → knowledge → wisdom.**
  - **Patterns, correlations, trends.**
  - **Statistical analysis, machine learning.**
  - **Visualization** (charts, dashboards).
- **Bias in data:**
  - **Sampling bias:** non-representative sample.
  - **Historical bias:** data reflects past discrimination.
  - **Measurement bias:** wrong things measured.
  - **Algorithmic bias:** algorithms can amplify bias.
  - **Real-world examples:** facial recognition less accurate for darker skin; hiring algorithms biased against women.
- **Cleaning data:**
  - **Remove duplicates.**
  - **Handle missing values.**
  - **Standardize formats** (dates, units).
  - **Detect outliers.**
- **Filtering and processing data:**
  - **Filter** to subset.
  - **Sort.**
  - **Aggregate** (sum, count, average).
  - **Group by** category.

### Adds for [4]

- **Why binary:**
  - **Two states** easy to represent (on/off, high/low voltage).
  - **Reliable** at electronic level.
  - **Boolean logic** (AND, OR, NOT) maps directly.
- **ASCII vs Unicode:**
  - **ASCII (1960s):** 7-bit; 128 characters; English only.
  - **Unicode:** much wider; supports all languages, emoji.
  - **UTF-8** is variable-length Unicode encoding (most common on web).
- **Image compression deep dive:**
  - **JPEG (lossy):** discards detail less perceptible to humans.
  - **PNG (lossless):** preserves perfectly; larger files.
  - **Photo:** JPEG common (lossy acceptable).
  - **Logo/diagram:** PNG common (lossless preferred for sharp edges).
- **Audio compression:**
  - **MP3 (lossy):** removes inaudible frequencies.
  - **FLAC (lossless):** preserves CD-quality.
  - **MP3 ~10x smaller** than uncompressed; quality loss often imperceptible.
- **Privacy and metadata:**
  - Photos with **GPS metadata** can reveal location.
  - Email metadata can show communication patterns even without content.
  - Document metadata can reveal author identity.
  - Privacy tools strip metadata.
- **Data analysis pipelines:**
  - **Collect** → **clean** → **analyze** → **visualize** → **interpret** → **act**.
  - Each step requires care; bias can enter at any step.

### Adds for [5]

- **Why data matters.**
  - **Big Data era:** more data than ever (sensors, social media, transactions).
  - **Machine learning** depends on data.
  - **Decisions increasingly data-driven** (business, medicine, government).
- **Why bias matters.**
  - **Algorithms make consequential decisions** (hiring, lending, policing, healthcare).
  - **Biased data → biased outcomes.**
  - **Hard to detect** without active auditing.
  - **Examples:** Amazon's biased hiring algorithm; biased recidivism algorithms (COMPAS).
- **Why data privacy matters.**
  - **Personal data** valuable to companies.
  - **Surveillance** capabilities exceed any prior era.
  - **GDPR** (EU) and other laws regulate.

## Worked Examples

### Example 1 [3] — Binary conversion

Convert 13 to binary.
- 13 = 8 + 4 + 1 = 2^3 + 2^2 + 2^0 = **1101**.

Convert binary 10101 to decimal.
- 1·16 + 0·8 + 1·4 + 0·2 + 1·1 = **21**.

### Example 2 [3] — Compression

For each, identify lossy or lossless, and justify:
(a) JPEG photo.
(b) PNG logo.
(c) MP3 song.
(d) ZIP archive of code.

- (a) **Lossy** (smaller file; some detail lost).
- (b) **Lossless** (sharp edges preserved; preferred for graphics).
- (c) **Lossy** (smaller; removes inaudible frequencies).
- (d) **Lossless** (code must be perfect; ZIP preserves exactly).

### Example 3 [4] — Metadata

What metadata might a photo have?
- **Date/time taken.**
- **GPS location.**
- **Camera model and settings** (aperture, shutter speed, ISO).
- **File format and size.**
- **Privacy implication:** metadata can reveal location/time even if you didn't intend to share.

### Example 4 [4] — Data bias

A facial recognition system works well for white men but poorly for Black women. Why might this be?
- **Training data** likely had mostly white male faces.
- **Algorithm learned features** of well-represented group; failed to generalize.
- **Sampling bias** in training data.
- **Real-world impact:** misidentifications disproportionately harm underrepresented groups.

### Example 5 [5] — Data pipeline

Describe steps in a data analysis pipeline.
- **Collect:** gather data (survey, sensor, scraping).
- **Clean:** remove duplicates, handle missing values, standardize formats.
- **Analyze:** statistical analysis, find patterns.
- **Visualize:** charts, graphs.
- **Interpret:** what does it mean? What's bias?
- **Act:** make decisions; communicate findings.

## Top Traps & Common Errors

1. **Confusing lossy and lossless.** Lossy: smaller, irreversible (JPEG, MP3). Lossless: perfect, reversible (PNG, ZIP, FLAC).
2. **Wrong bit/byte.** Bit = 0 or 1. Byte = 8 bits.
3. **Wrong values per n bits.** n bits = 2^n possible values.
4. **Confusing ASCII and Unicode.** ASCII: 7-bit, English. Unicode: wider, all languages.
5. **Forgetting metadata privacy.** Metadata reveals more than people realize.
6. **Ignoring bias sources.** Bias enters at collection, sampling, measurement, modeling.

## Rubric-Aware Tactics

**For binary questions:**
- Show conversion work.
- Identify number of bits / values.

**For compression questions:**
- Identify lossy or lossless.
- Justify choice for use case.

**For data analysis questions:**
- Identify steps.
- Address potential biases.

## "Phrases That Score" — verbatim language for FRQs

1. "All digital data is represented in binary (0s and 1s); n bits can represent 2^n distinct values. Numbers, text (ASCII, Unicode), images (pixels with RGB), audio (samples), and video all reduce to binary."
2. "Lossless compression (PNG, ZIP, FLAC) preserves all data and is reversible. Lossy compression (JPEG, MP3, MP4) discards some data permanently for smaller file sizes — appropriate when minor quality loss is acceptable."
3. "Metadata is data about data — photo timestamps and GPS, document authorship, email headers — useful for organization and search but with significant privacy implications."
4. "Data bias arises from sampling bias (non-representative data), historical bias (data reflecting past discrimination), measurement bias, or algorithmic bias — and can produce unfair outcomes when algorithms make consequential decisions in hiring, lending, and policing."
5. "Data analysis follows a pipeline: collect, clean, analyze, visualize, interpret, act. Bias can enter at any step, requiring careful auditing for fairness."

## If You Do Nothing Else for This Big Idea

*Master binary↔decimal conversions. Master lossy vs lossless compression. Master metadata and privacy implications. Master data bias sources. Master data analysis pipeline.*

_lastUpdated: 2026-05-04
_sources: College Board AP CSP CED 2024-25, Barron's AP CSP, Princeton Review AP CSP 2025, Khan Academy CS resources
_difficulty: foundational
_relatedUnits: ap-csp-big-idea-1-creative-development, ap-csp-big-idea-3-algorithms-programming, ap-csp-big-idea-5-impact-of-computing
