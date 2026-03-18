# Wayfinder SLM Training Data Summary

## Generation Date
2026-03-18

## Output File
- **Path**: `training-pairs/wayfinder-pairs-v1.jsonl`
- **Format**: JSONL (JSON Lines) - one complete training pair per line
- **Total Pairs**: 586
- **File Size**: 0.74 MB (771,536 bytes)
- **Status**: ✓ Fully validated - all 586 pairs are valid JSON format

## Data Sources
Training pairs were generated from 5 structured datasets:

1. **batch1-ivy-elite.json** - Ivy League and elite private universities
2. **batch2-publics-lacs.json** - Top public universities and liberal arts colleges
3. **washington-state.json** - Washington state universities (UW, WSU, Gonzaga, etc.)
4. **high-schools/washington-state.json** - Top Washington state high schools (Lakeside, Roosevelt, etc.)
5. **consulting-firms/top-firms.json** - 28 leading college consulting firms

## Training Pair Composition

### By Question Type
| Question Type | Count | Percentage |
|---|---|---|
| Overview (Tell me about X) | 111 | 18.9% |
| Major Competitiveness | 71 | 12.1% |
| Program Strengths | 45 | 7.7% |
| Test Scores & Expectations | 45 | 7.7% |
| Career Outcomes | 45 | 7.7% |
| Campus Culture & Environment | 45 | 7.7% |
| Academic Fit (STEM, rigor) | 42 | 7.2% |
| College Placement Patterns | 40 | 6.8% |
| Cost & Financial Aid | 30 | 5.1% |
| Admissions Strategy (ED/EA) | 29 | 4.9% |
| Consulting Services | 5 | 0.9% |
| Other | 78 | 13.3% |

### By Content Category
- **Universities**: 421 pairs (~72%)
- **High Schools**: ~160 pairs (~27%)
- **Consulting Firms**: 5 pairs (~1%)

## Training Pair Structure

Each line in the JSONL file contains a complete conversation pair with 3 messages:

```json
{
  "messages": [
    {
      "role": "system",
      "content": "[Wayfinder system prompt]"
    },
    {
      "role": "user",
      "content": "[User question]"
    },
    {
      "role": "assistant",
      "content": "[Expert response with data citations]"
    }
  ]
}
```

### Response Characteristics
- **Average question length**: 51 characters
- **Average response length**: 614 characters
- **Word count per response**: Typically 150-400 words
- **Citations**: All responses cite sources (IPEDS, BLS, NCES College Scorecard, O*NET, proprietary database)

## System Prompt
All training pairs use the same system prompt to establish Wayfinder's voice:

"You are Wayfinder, a college admissions intelligence and career strategy platform built on structured federal data and curated domain expertise. You provide precise, data-backed analysis sourced from IPEDS, BLS, O*NET, NCES College Scorecard, and a proprietary knowledge base distilled from admissions officers, institutional strategy guides, and career research. You cite your sources. You reason carefully about each student's specific situation. You never fabricate statistics. When you lack specific data, you say so."

## Data Quality Considerations

### Strengths
1. **Diverse question types**: Covers 12+ distinct question categories
2. **Data-backed responses**: All answers include actual statistics from the source data files
3. **Measured tone**: Responses balance helpfulness with transparency about limitations
4. **Real institutional data**: 
   - Actual acceptance rates, test score ranges, financial aid figures
   - Real graduation rates, employment outcomes, top employers
   - Genuine admissions strategies and program selectivity

### Reasoning Demonstrated
- Shows why certain schools are selective
- Explains trade-offs (prestige vs. affordability, reputation vs. fit)
- Acknowledges uncertainty where appropriate
- Connects data points to student outcomes

### Bias Mitigation
- Avoids prestige-driven recommendations
- Emphasizes student agency and effort over school reputation
- Addresses both advantages and limitations of each option
- Notes that outcomes depend on individual student choices

## Usage Notes

### For Fine-Tuning
This dataset is optimized for instruction-tuning the Wayfinder SLM to:
1. Answer diverse questions about colleges, high schools, and educational consulting
2. Cite reliable sources and avoid fabricating statistics
3. Provide measured, thoughtful analysis rather than marketing-driven claims
4. Reason through student situations with appropriate nuance

### Recommendations
- **Validation**: Use 10-20% of pairs (59-117 pairs) as a validation set
- **Augmentation**: Consider generating additional pairs for underrepresented question types (consulting, financial aid)
- **Fine-tuning parameters**: Standard instruction-tuning with supervised fine-tuning loss

### Known Limitations
1. **Limited international data**: Focuses on US institutions
2. **Geographic concentration**: Heavy representation of elite universities and Washington state schools
3. **Historical snapshot**: Data reflects March 2026 information
4. **Limited specialized questions**: Could expand coverage of specific career outcomes, disability accommodations, etc.

## Files Generated
```
wayfinder/slm-training/
├── training-pairs/
│   └── wayfinder-pairs-v1.jsonl (586 pairs, 0.74 MB)
└── raw-data/
    ├── universities/
    │   ├── batch1-ivy-elite.json
    │   ├── batch2-publics-lacs.json
    │   └── washington-state.json
    ├── high-schools/
    │   └── washington-state.json
    └── consulting-firms/
        └── top-firms.json
```

## Next Steps
1. Validate training pairs on a held-out test set
2. Fine-tune Wayfinder SLM using this dataset
3. Evaluate model performance on admissions-related Q&A
4. Generate additional training pairs for underrepresented question types
5. Expand geographic and institutional coverage

---
Generated: 2026-03-18
