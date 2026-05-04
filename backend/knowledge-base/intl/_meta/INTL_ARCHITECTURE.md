# Wayfinder International Brain Architecture

Goal: make Wayfinder a global education-guidance platform. First market: Korea.

## Layered design

```
backend/knowledge-base/intl/
├── _meta/                     ← framework documentation (this file)
├── korea/                     ← 한국 — Phase 1 (current)
│   ├── _brain.md              ← top-level orientation (loaded as system context)
│   ├── universities-sky.md    ← Seoul/Korea/Yonsei tier
│   ├── universities-tier2.md  ← 서성한 + 중경외시 + ...
│   ├── csat-suneung.md        ← 수능 (CSAT) overview + strategy
│   ├── admissions-paths.md    ← 학종 vs 정시 vs 논술 vs 실기
│   ├── high-schools-special.md← 특목고/자사고/외고/과고
│   ├── us-from-korea.md       ← Korean families pursuing US admissions
│   ├── glossary.md            ← bilingual term map
│   └── advisor-prompt-ko.md   ← Korean Wayfinder Advisor system prompt
├── japan/                     ← Phase 2 (future)
├── china/                     ← Phase 3 (future)
└── singapore-asean/           ← Phase 4 (future)
```

## How the central brain becomes "aware"

1. **Auto-discovery**: `services/intl-brain.js` scans `intl/<country>/*.md` at boot, indexes by country slug + filename. Same pattern as `loadApUnitsBrains()`.

2. **Language detection in chat router** (`routes/chat.js`):
   - Hangul characters in user message (any of `[ㄱ-힝]`) → set `langCode='ko'`.
   - Future: katakana/hiragana → `ja`. Hanzi-only without Korean → `zh`.

3. **Routing override for non-English queries**:
   - When `langCode !== 'en'`: bypass SLM (it's English-trained), route directly to Claude (Sonnet for free, Opus for paid) with the localized advisor system prompt.
   - Inject the country brain block + relevant unit-files via curated-search.

4. **Curated-search aware**:
   - New `intl_korea` module in `services/curated-search.js` triggered by Hangul OR English-language Korean keywords ('SKY', 'Seoul University', '수능', 'CSAT Korea').
   - Pulls top entries from `intl/korea/*.md` using same scoring approach.

5. **Critical-facts injector**:
   - New `korea_admissions` topic with the immutable facts (3 SKY admit rates, 수능 weight ~70-100% by 정시 vs 학종, etc.).

## Korean-speaking advisor

- The SLM is English-only — never serves Korean queries.
- Korean queries go to Claude with a Korean system prompt that opens with **존댓말 (formal speech)** by default, switches to **반말 (casual)** only if the user uses casual forms.
- Korean cultural context: family hierarchy in college decisions (부모님 결정 권한 큼), 사교육 (private tutoring) culture, 재수/삼수 (gap years for 수능 retake) is normalized, the 인서울 (in-Seoul university) preference.
- Wayfinder identity stays consistent: never mention Claude/Anthropic.

## Future: language toggle UI

A header-level `EN | 한국어 | 日本語 | ...` toggle. Stores preference in localStorage (`wf_lang`). When set, every chat request includes `langCode`. UI labels can localize incrementally (modal headings, sidebar labels, etc.).
