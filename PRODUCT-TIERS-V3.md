# Wayfinder Product Architecture v3 — Three Product Lines

## Overview

Wayfinder operates THREE independent product lines, each with its own SLM, subscription tiers, and value proposition. Users can subscribe to one, two, or all three.

---

## PRODUCT 1: ADMISSIONS INTELLIGENCE

**Target:** High school students + parents planning for college

| Tier | Price | Engine Pulls | Token Limits | Features |
|------|-------|-------------|-------------|----------|
| **Free (Explorer)** | $0 | 3/day | 50K/day | Basic chat, school search, limited data |
| **Coach** | $25/mo | 20/day | 250K/day, 5M/mo | Full demographics, decision dates, timeline widget, essay coaching, program search |
| **Consultant** | $50/mo | 40/day | 500K/day, 12M/mo | All Coach + compare tool, full internships/scholarships/programs, email reminders, priority support |

**Essay Review Add-On (one-time):**
- Starter: 5 reviews / $10
- Standard: 10 reviews / $15
- Bulk: 20 reviews / $20

**SLM:** wayfinder-admissions (LLaMA 3.1 8B, fine-tuned on 3,000+ admissions pairs)

---

## PRODUCT 2: CAREER INTELLIGENCE

**Target:** Students choosing majors, career changers, professionals navigating transitions

| Tier | Price | Engine Pulls | Token Limits | Features |
|------|-------|-------------|-------------|----------|
| **Free (Explorer)** | $0 | 3/day | 50K/day | Basic career chat, limited salary data |
| **Pro** | $15/mo | 20/day | 250K/day, 5M/mo | Full salary data, industry intel, career pathway maps, skills assessment |
| **Elite** | $30/mo | 40/day | 500K/day, 12M/mo | All Pro + ROI analysis, negotiation coaching, executive career strategy, priority support |

**SLM:** wayfinder-career (LLaMA 3.1 8B, fine-tuned on 2,000+ career pairs)

---

## PRODUCT 3: TEST PREP INTELLIGENCE (NEW)

**Target:** Students preparing for SAT/ACT, parents managing test prep

| Tier | Price | Engine Pulls | Token Limits | Features |
|------|-------|-------------|-------------|----------|
| **Free (Explorer)** | $0 | **No engine pulls** — standard chat only | 50K/day | Talk to test advisor (basic guidance), NO deep analysis or concept coaching |
| **Test Coach** | $25/mo | 20/day | 250K/day, 5M/mo | Concept-based coaching, study plan generation, practice problem explanations, progress tracking, math/reading/writing coaching, **Vocabulary Hacker** |
| **Test Consultant** | $50/mo | 40/day | 500K/day, 12M/mo | All Coach + **Vocabulary Hacker** (enhanced), advanced strategy coaching, score prediction analytics, ACT Science coaching, priority support |

**SAT/ACT Adaptive Prep Module (one-time):**
- **$200 per test** — must choose SAT OR ACT (cannot get both in one purchase)
- Can purchase again for the other test ($200 each)
- 5 full-length practice exams + 5 targeted practice sets + intelligence reports
- Available to ALL paid tiers (Coach or Consultant) + standalone purchase
- Sequential unlock: must complete each exam/report/practice set to access next
- Personalized — every practice set generated from YOUR specific concept gaps

**CogAT Adaptive Prep Module (one-time):**
- **$100** — AI-powered cognitive abilities test preparation
- Targets elementary/middle school students (grades 2-8) preparing for gifted/talented testing
- Covers all 3 CogAT batteries: Verbal, Quantitative, Nonverbal reasoning
- Adaptive diagnostic → personalized practice → concept-based coaching
- NOTHING like this exists anywhere — first AI-powered CogAT prep tool
- Available to any tier (free, Coach, Consultant) as a standalone purchase

**SLM:** wayfinder-testprep (LLaMA 3.1 8B, fine-tuned on test prep + CogAT coaching pairs)

---

## STRIPE PRICE IDs NEEDED

### Admissions (existing):
- STRIPE_PRICE_ADMISSIONS_COACH = $25/mo
- STRIPE_PRICE_ADMISSIONS_CONSULTANT = $50/mo

### Career (existing):
- STRIPE_PRICE_CAREER_PRO = $15/mo
- STRIPE_PRICE_CAREER_ELITE = $30/mo

### Test Prep (NEW — create in Stripe):
- STRIPE_PRICE_TEST_COACH = $25/mo
- STRIPE_PRICE_TEST_CONSULTANT = $50/mo
- STRIPE_PRICE_TEST_SAT_MODULE = $200 one-time (SAT Adaptive Prep)
- STRIPE_PRICE_TEST_ACT_MODULE = $200 one-time (ACT Adaptive Prep)
- STRIPE_PRICE_TEST_COGAT_MODULE = $100 one-time (CogAT Adaptive Prep)

### Essay Credits (existing):
- STRIPE_PRICE_ESSAY_5 = $10
- STRIPE_PRICE_ESSAY_10 = $15
- STRIPE_PRICE_ESSAY_20 = $20

---

## BUNDLE OPPORTUNITIES

| Bundle | Price | Savings | Target |
|--------|-------|---------|--------|
| **Admissions + Test Prep Coach** | $40/mo | Save $10 | Juniors/seniors in both admissions + test prep mode |
| **Admissions + Test Prep Consultant** | $80/mo | Save $20 | Serious families going all-in |
| **All Three Coach** | $55/mo | Save $10 | Power users |
| **All Three Consultant** | $110/mo | Save $20 | Premium families |

---

## CROSS-PRODUCT INTELLIGENCE

When a user has multiple products:
- **Admissions + Test Prep:** SLMs share context. Test prep knows what schools the student is targeting → calibrates score goals. Admissions knows the student's test scores → adjusts school list strategy.
- **Admissions + Career:** Student exploring "what should I major in?" gets both admissions strategy AND career trajectory data in one conversation.
- **Career + Test Prep:** Rare overlap, but possible for adult test-takers (GRE/GMAT coaching could extend here).

Dual-membership users get the "cross-model handoff" — one SLM can invoke the other when a question spans domains.

---

## REVENUE MODEL

**Conservative estimate (Year 1):**
- 500 users × $25/mo average = $12,500 MRR
- 100 adaptive modules × $200 = $20,000 one-time
- 200 essay credit packs × $15 avg = $3,000 one-time
- **Year 1 target: $170,000-$200,000 ARR**

**Growth estimate (Year 2 with SEO + word of mouth):**
- 2,000 users × $30/mo average = $60,000 MRR
- 500 adaptive modules × $200 = $100,000 one-time
- **Year 2 target: $800,000+ ARR**

---

## TECHNICAL ARCHITECTURE

### User Profile Schema Addition:
```javascript
// Add to user profile:
{
  // Existing admissions fields...

  // Test Prep fields:
  testPrepPlan: 'free' | 'coach' | 'consultant',
  testPrepStripeSubscriptionId: null,
  adaptiveModulePurchased: false,
  diagnosticCompleted: false,
  diagnosticResults: null,  // concept mastery scores
  examProgress: {
    exam1: null, exam2: null, exam3: null, exam4: null, exam5: null,
    practiceSet1: null, practiceSet2: null, practiceSet3: null, practiceSet4: null, practiceSet5: null,
  },
  vocabProgress: {
    currentWeek: 0,
    wordsLearned: 0,
    retentionRate: 0,
    wordSets: [],
  },
  testScores: {
    satDiagnostic: null,
    actDiagnostic: null,
    targetScore: null,
    examScores: [],  // from practice exams
  },
}
```

### New Routes Needed:
- POST /api/testprep/diagnostic — start diagnostic assessment
- GET /api/testprep/diagnostic/results — get results
- POST /api/testprep/studyplan — generate personalized plan
- GET /api/testprep/progress — get exam/practice set progress
- POST /api/testprep/exam/:number/submit — submit exam answers
- GET /api/testprep/exam/:number/report — get intelligence report
- POST /api/testprep/vocab/set — get current vocabulary set
- POST /api/testprep/vocab/quiz — submit vocab quiz results

### SLM Routing Logic:
```javascript
// In chat.js or a new router:
function selectSLM(message, userProfile) {
  const product = detectProduct(message, userProfile);
  switch (product) {
    case 'admissions': return 'wayfinder-admissions';
    case 'career': return 'wayfinder-career';
    case 'testprep': return 'wayfinder-testprep';
    default: return 'wayfinder-general'; // fallback to Claude Sonnet
  }
}
```
