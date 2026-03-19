# Wayfinder Admissions Essay Strategy Training Data

## File Information
- **Location:** `/slm-training/admissions-essay-strategy.jsonl`
- **Format:** JSONL (JSON Lines - one conversation pair per line)
- **Total Pairs:** 8 multi-turn conversation pairs
- **Category:** Essay Strategy (topic selection, supplemental management, portfolio planning, timeline management, Why Us essay strategy)

## Training Data Specifications

### System Prompt
All conversations use the Wayfinder system prompt:
> "You are Wayfinder, an elite AI college admissions consultant. You provide the caliber of strategic advice that families pay $10,000-$15,000 for from private consultants — but accessible to everyone. You are warm, data-driven, and strategically honest."

### Response Length
- Assistant responses: 200-400 words (strategic and actionable)
- Warm but direct tone
- Data-driven reasoning with specific examples
- Specific school references (MIT, Stanford, Duke, CMU, Northwestern, Caltech, etc.)

### Conversation Structure
- Multi-turn conversations (2-3 turns each)
- Real-sounding user personas (stressed seniors, overwhelmed parents, confused juniors, etc.)
- Progressive complexity (initial problem → clarification → tactical advice)

## Requirement Coverage

✓ **Managing 10+ School Applications** (3 pairs)
- Pair 1: 12-school strategy (Tiers, templates, math)
- Pair 2: 13-school list management (Cutting vs. researching)
- Pair 6: Parent perspective on 10-school overwhelm

✓ **Why Us Essay Strategy** (2 pairs)
- Pair 4: Duke essay about community values vs. intellectual engagement
- Pair 8: MIT essay about fit vs. why MIT is great

✓ **Supplemental Essay Strategy** (3 pairs)
- Pair 1: Reusing vs. adapting essays across schools
- Pair 3: Different prompts (Duke, MIT, Stanford, Cornell) single template approach
- Pair 2: School-specific customization framework

✓ **Additional Information Section** (1 pair)
- Pair 5: Using additional information for financial hardship context

✓ **Timeline & Process Management** (3 pairs)
- Pair 3: 10-week crunch timeline management
- Pair 7: Junior starting essays (realistic timeline from June through December)
- Pair 1: September start for 12 schools (ruthless prioritization)

## Conversation Personas

1. **Stressed Senior with 12 Schools** — Managing multiple applications without burning out
2. **Senior Questioning School List** — Deciding between 13 schools with partial genuine interest
3. **Senior with Tight Timeline** — Starting essays only 10 weeks before January 1st deadline
4. **Senior Revising Duke Essay** — Balancing community values with intellectual engagement
5. **Senior with Financial Hardship Context** — Using additional information strategically
6. **Parent Helping Overwhelmed Student** — Supporting without writing for the student
7. **Junior Planning Ahead** — Realistic timeline for essay preparation (months 6-12 before senior year)
8. **Senior Revising MIT Essay** — Shifting from school features to personal fit

## Key Strategic Concepts Covered

- **Template Reuse Strategy:** 70% core intellectual passion + 20% adapted structure + 10% school-specific details
- **The Swap School Name Test:** Replace school name with competitor; if essay still works, it's too generic
- **Multi-Turn Dialogue Pattern:** Problem identification → diagnostic questions → tactical framework
- **Real School References:** MIT, Stanford, Caltech, Duke, Northwestern, Cornell, CMU, Rice, UW, Georgia Tech, Berkeley
- **Financial Context Framing:** How to use additional information section without sounding like excuses
- **Parent Boundary Setting:** Organizing vs. writing — what parents should/shouldn't do
- **The Core Themes Approach:** 2-3 intellectual obsessions adapted across 10+ schools
- **Research-First Process:** Deep research before writing = natural specificity

## Topic Distribution

| Topic | Count |
|-------|-------|
| Timeline Management | 3 |
| Multiple Applications | 3 |
| Supplemental Strategy | 3 |
| Topic Selection | 2 |
| Why Us Essay | 2 |
| School Selection | 1 |
| School Research | 1 |
| Additional Information | 1 |
| Context Framing | 1 |
| School-Specific Fit | 1 |
| Project Management | 1 |
| Process Planning | 1 |
| Realistic Expectations | 1 |

## Use Cases for SLM Training

This dataset trains the Wayfinder Admissions SLM to:

1. **Diagnose application challenges** — Ask clarifying questions to understand root causes
2. **Provide strategic frameworks** — Give actionable, data-driven guidance that goes beyond generic advice
3. **Reference specific schools** — Name schools and their actual characteristics authentically
4. **Set realistic expectations** — Balance ambition with pragmatism about timelines and effort
5. **Address parent concerns** — Guide parental involvement appropriately (supportive but not controlling)
6. **Teach template strategies** — Show how to reuse core materials while maintaining authenticity and specificity
7. **Manage psychological aspects** — Address overwhelm, perfectionism, authenticity concerns
8. **Emphasize research depth** — Stress research-first approach to prevent generic essays

## Integration with Knowledge Base

These conversations reference and apply insights from:
- `essay-supplement-type-mastery.md` — "Why Us?" decoding, supplemental types, specificity requirements
- `essay-ecosystem-strategy.md` — Narrative architecture, gap-to-supplement mapping, theme distribution
- `essay-process-timeline.md` — Timeline scenarios, process management, readiness protocols

## Quality Markers

✓ Grounded in actual student/parent scenarios
✓ Advice is replicable (not generic encouragement)
✓ Schools mentioned are real with authentic positioning
✓ Multi-turn conversations show depth of thinking
✓ Acknowledges constraints and trade-offs
✓ Warm tone without sacrificing strategic honesty
✓ References specific frameworks (template reuse, swap school test, core themes)
✓ Addresses emotional/psychological dimensions alongside tactical advice

---
**Generated:** March 18, 2026
**System:** Wayfinder Essay Deep Intelligence v1.0
**Ready for:** SLM fine-tuning on essay strategy conversations
