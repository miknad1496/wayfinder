# Wayfinder Training Data Generation Report (Batch B7)

**Generated:** March 19, 2026
**Status:** COMPLETE

## Summary

Successfully generated **100 high-quality training pairs** across three specialized domains for the Wayfinder SLM system.

### File Inventory

| File | Pairs | Size | Status |
|------|-------|------|--------|
| admissions-quality-b7.jsonl | 40 | 38.6 KB | ✓ Valid |
| career-quality-b7.jsonl | 40 | 36.3 KB | ✓ Valid |
| testprep-quality-b7.jsonl | 20 | 18.6 KB | ✓ Valid |
| **TOTAL** | **100** | **93.5 KB** | ✓ Complete |

## File 1: ADMISSIONS (40 pairs)
**Path:** `/sessions/compassionate-exciting-bell/mnt/Wayfinder/wayfinder/slm-training/admissions-quality-b7.jsonl`

### System Prompt
> "You are Wayfinder, an elite AI college admissions consultant. Warm, data-driven, strategically honest."

### Coverage (40 unique scenarios)
- GPA/SAT strategy and test score decisions
- Financial aid negotiation and affordability analysis
- Waitlist strategy and letters of continued interest
- International student admissions
- Recruited athlete early decision timing
- Performing arts portfolio evaluation
- School transfer narrative and GPA recovery
- Essay topic selection and second-gen identity
- Homeschooled applicant credibility
- Business school early decision tradeoffs
- Likely letters and binding commitments
- First-generation student context
- Community leadership demonstration
- SAT retake decisions
- Prestige vs. fit analysis
- Peer school comparison

### Key Characteristics
- 3-4 turn conversations (system → user → assistant → user → assistant)
- 250-400 word average assistant responses
- Includes self-correction and surprising insights
- Persona variety (students, parents, transferred students, athletes, artists)
- Real midnight-before-deadline scenarios
- Honest assessment of strategic tradeoffs

---

## File 2: CAREER (40 pairs)
**Path:** `/sessions/compassionate-exciting-bell/mnt/Wayfinder/wayfinder/slm-training/career-quality-b7.jsonl`

### System Prompt
> "You are Wayfinder, an AI career strategist. Real labor market data, practical wisdom. Warm, trajectory-focused."

### Coverage (40 unique scenarios)
- Career pivots with financial constraints
- SWE → Product/Sales transitions
- Re-entry after gaps (motherhood, time off)
- BigLaw exit strategies
- Teacher burnout and career switching
- Mid-career age concerns (35+)
- Startup equity evaluation
- Entry-level offer comparison
- Management challenges and resource constraints
- Freelancing vs. employment tradeoffs
- Master's degree decisions (MBA vs. Data Science)
- Impostor syndrome at promotion
- Mentor finding and guidance
- Mission alignment vs. compensation
- Burnout culture and boundaries
- Gap year decisions

### Key Characteristics
- Vulnerability and shame narratives (the questions people are afraid to ask)
- Real labor market data and realistic timelines
- Reframes anxiety-driven decisions
- Addresses "I'm trapped" narratives
- Practical, actionable strategy
- Acknowledges constraints without false optimism

---

## File 3: TEST PREP (20 pairs)
**Path:** `/sessions/compassionate-exciting-bell/mnt/Wayfinder/wayfinder/slm-training/testprep-quality-b7.jsonl`

### System Prompt
> "You are Wayfinder Test Prep Coach. Concept-focused, intuitive, warm."

### Coverage (20 unique scenarios)

**SAT/ACT (10 pairs):**
- Math score plateaus and targeted practice
- ACT composite score improvement (34→35)
- Word problem execution errors
- Reading section timing strategy
- SAT improvement timelines (1-month aggressive)
- Test anxiety and real environment simulation
- Geometry/trigonometry confidence building
- ACT English vs. grammar mechanics
- Reading comprehension improvement (650→750)
- SAT retake after minimal gains

**CogAT (10 pairs):**
- CogAT format familiarization
- Nonverbal reasoning development
- Quantitative reasoning vs. math distinction
- Visual pattern recognition coaching (gifted student)
- Analytical approach to visual reasoning
- Minimal prep for gifted learners

### Key Characteristics
- **CoT (Chain-of-Thought) in all math problems**
- Interactive coaching style with check questions
- Diagnostic approach (diagnose before prescribing)
- Concept-focused (not just test tactics)
- Realistic timelines (2-6 weeks typical)
- Pattern recognition over memorization
- Address test anxiety separately from content gaps

---

## JSON Schema

All files follow this structure:

```json
{
  "conversations": [
    {
      "role": "system",
      "content": "..."
    },
    {
      "role": "user",
      "content": "..."
    },
    {
      "role": "assistant",
      "content": "..."
    },
    {
      "role": "user",
      "content": "..."
    },
    {
      "role": "assistant",
      "content": "..."
    }
  ],
  "metadata": {
    "category": "admissions|career|test-prep",
    "topics": ["topic1", "topic2", "topic3"]
  }
}
```

- **One conversation per line** (valid JSONL)
- **3-5 exchanges per conversation** (system, user, assistant, user, assistant)
- **Self-contained scenarios** (no external dependencies)
- **Metadata for categorization and filtering**

---

## Quality Metrics

### Admissions
- Real school decision scenarios (Duke/UNC, Williams/Amherst, etc.)
- Authentic student voice and concerns
- Data-driven recommendations
- Addresses structural inequality (first-gen, international)
- Reframes prestige anxiety

### Career
- Real career anxiety (age, burnout, transition)
- Honest about financial tradeoffs
- Labor market context
- Questions people don't ask aloud
- Multi-year perspective

### Test Prep
- Diagnostic first, prescription second
- Concept foundation over tricks
- Realistic time management
- Anxiety handled separately
- Interactive coaching (not lecturing)

---

## Usage

Load with:
```python
import json

with open('admissions-quality-b7.jsonl', 'r') as f:
    for line in f:
        pair = json.loads(line)
        # Use pair['conversations'] and pair['metadata']
```

Or in training pipeline:
```
python train.py --train-data admissions-quality-b7.jsonl --category admissions
```

---

## Notes

- All 100 pairs feature **multi-turn conversations** (not single Q&A)
- **Surprising insights** (self-correction, reframes) in majority of pairs
- **Persona variety** across all three files (students, parents, professionals, teachers)
- **250-400 word responses** maintain substantive dialogue
- **Every scenario is unique** (no copy-paste scenarios)
- Files are **immediately usable** for fine-tuning, DPO, or supervised learning

---

**End of Report**
