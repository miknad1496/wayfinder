# Athletic Recruitment Brain — NCAA/NAIA Division Structure, Academic Index, Recruitment Timelines & School List Integration

## Purpose

Recruited athletes represent **10-20% of admitted students** at many selective schools — and at Ivy League schools, recruited athletes can comprise 20-25% of each class. Yet most college advisors treat athletic recruitment as a separate process disconnected from academic strategy. This brain integrates the two: it tells the SLM how athletic recruitment changes the admissions probability model and how to modify the school-list-builder logic for recruited athletes.

**Compliance Gate:** Wayfinder provides information about athletic recruitment processes based on publicly available NCAA, NAIA, and institutional data. Wayfinder does not act as an athletic recruiting service, does not contact coaches on behalf of students, and does not guarantee athletic scholarship offers or recruitment outcomes. See `compliance-brain.md`.

---

## MODULE 1: THE DIVISION STRUCTURE — D1, D2, D3, NAIA

### Understanding the Landscape

| Division | # of Schools | Athletic Scholarships? | Academic Profile | The Real Story |
|----------|-------------|----------------------|-----------------|----------------|
| **NCAA Division I** | ~360 | YES — full and partial scholarships in most sports | Varies widely (from Ivy League to open-enrollment) | The highest level of college athletics. Revenue sports (football, basketball) drive institutional investment. Non-revenue sports (swimming, fencing, rowing) still offer scholarships but with less institutional support |
| **NCAA Division II** | ~300 | YES — partial scholarships (fewer than D1) | Generally mid-tier academics | The overlooked middle. D2 schools offer meaningful athletic competition + academic programs + scholarship money. The sweet spot for athletes who are good but not D1 elite |
| **NCAA Division III** | ~440 | NO athletic scholarships (merit/need aid only) | Generally strong academics (includes many T50 LACs) | The academic athlete's division. No athletic scholarships means every admitted athlete also met the academic bar. Schools include Amherst, Williams, MIT, Chicago, Emory, WashU, Carnegie Mellon, NYU, Tufts |
| **NAIA** | ~250 | YES — athletic scholarships available | Varies widely | The alternative system. Smaller schools, faster recruitment process (no restrictive contact rules like NCAA). Many are faith-based institutions |
| **Ivy League** | 8 | NO athletic scholarships. Financial aid only (need-based) | Elite academics | Technically D1 but unique rules: no athletic scholarships, no redshirting, Academic Index requirement. Recruited athletes get an admissions ADVANTAGE, not a scholarship |

### The Critical Distinction: "Recruited" vs. "Walk-On"

- **Recruited athlete:** A coach has actively identified, evaluated, and advocated for the student's admission. The coach provides the admissions office with a "recruit list" — a ranked list of athletes they want admitted. Being on this list fundamentally changes admissions probability
- **Walk-on:** A student applies normally and tries out for the team after enrolling. Walk-ons receive NO admissions advantage. At most D1 programs, walk-on spots are extremely limited
- **Preferred walk-on:** A coach has identified the student as a potential contributor but does not use a formal recruit slot. Some admissions consideration, but less than a full recruit

### Sport-Specific Scholarship Limits (NCAA D1)

| Sport | Scholarships (Men) | Scholarships (Women) | Headcount vs. Equivalency |
|-------|--------------------|-----------------------|---------------------------|
| Football (FBS) | 85 | N/A | Headcount (each scholarship is full) |
| Basketball | 13 | 15 | Headcount |
| Baseball | 11.7 | N/A | Equivalency (can be split among more athletes) |
| Softball | N/A | 12 | Equivalency |
| Soccer | 9.9 | 14 | Equivalency (men) / Headcount (women) |
| Swimming/Diving | 9.9 | 14 | Equivalency |
| Track & Field/XC | 12.6 | 18 | Equivalency |
| Tennis | 4.5 | 8 | Equivalency |
| Volleyball | 4.5 (M) | 12 (W) | Equivalency (men) / Headcount (women) |
| Lacrosse | 12.6 | 12 | Equivalency |
| Rowing | N/A | 20 | Equivalency |
| Golf | 4.5 | 6 | Equivalency |
| Fencing | 4.5 | 5 | Equivalency |

**"Equivalency" means scholarships are divided** among more athletes than the number suggests. A program with 9.9 equivalency scholarships might distribute partial awards to 25-30 athletes. This is critical for managing family expectations.

---

## MODULE 2: THE IVY LEAGUE ACADEMIC INDEX

### What It Is

The Academic Index (AI) is a numerical score (1-240 on the legacy scale) that Ivy League schools use to evaluate recruited athletes. It ensures that recruited athletes meet a minimum academic threshold. **The AI is the single most important number in Ivy athletic recruitment.**

### How It's Calculated (Approximate)

The AI combines three components:

```
Academic Index = Converted SAT Score + Converted SAT Subject Scores + Converted GPA

Component breakdown (legacy SAT scale 60-240):
- SAT/ACT: Concordance table converts to 60-80 scale
- Class Rank / GPA: Converted to 60-80 scale
- Combined to produce composite 60-240
```

**Post-2024 simplified model** (Subject Tests eliminated):
```
AI ≈ (SAT Composite / 16.67) + (Unweighted GPA × 20) + Institutional adjustment
```

The exact formula is proprietary and not published. Each Ivy calibrates differently. The key numbers:

| AI Range | What It Means |
|----------|--------------|
| **220-240** | Elite academic profile. No AI concerns. Recruit freely |
| **200-219** | Strong. Most Ivy coaches can recruit at this level without AI issues |
| **180-199** | Requires coach advocacy. May need to "AI balance" with higher-AI recruits on the same list |
| **Below 176** | The "AI floor." Most Ivy conferences have agreed that recruited athletes should not fall below ~1 standard deviation below the school's mean AI. Below this floor, even with a coach's support, the admissions office may reject |

### The AI Floor in Practice

The Ivy League agreement (not publicly documented but widely understood in recruiting circles):
- Each sport's recruited class must have an average AI within ~1 SD of the student body mean
- Individual recruits can fall below this IF balanced by high-AI recruits
- Coaches have a limited number of "low AI slots" per year (typically 1-3)
- The practical floor: ~SAT 1300 / GPA 3.5 unweighted at most Ivies. Below this, recruitment is extremely difficult regardless of athletic talent

### Strategic Implications for Families

1. **For athletes targeting Ivy recruitment:** The SAT/ACT score is NOT optional. Test-optional policies do NOT apply to recruited athletes in the same way — coaches need the AI calculation. Take the SAT/ACT seriously. Cross-reference `test-prep-strategic-brain.md`
2. **GPA maintenance is non-negotiable.** An athlete with a 3.2 UW GPA has severely limited Ivy options regardless of athletic talent
3. **The AI creates an advantage for high-academic athletes.** An athlete with a 1500 SAT / 3.9 GPA who is "good but not great" athletically may receive Ivy recruitment interest that a 1250/3.3 blue-chip athlete does not

---

## MODULE 3: THE RECRUITMENT TIMELINE

### NCAA D1 Recruitment Timeline (2025-2026 Rules)

The NCAA has reformed recruiting contact rules multiple times. Current rules (post-2024):

| Grade | What Should Be Happening | Key Actions |
|-------|-------------------------|-------------|
| **9th Grade** | Building athletic profile. Attending camps. NO direct coach contact initiated by the student is necessary yet (but not prohibited) | Create a highlight video. Register with NCAA Eligibility Center (formerly Clearinghouse). Begin tracking academic eligibility (core course requirements) |
| **10th Grade** | Attending college camps and showcases. Coaches are WATCHING but limited in direct contact | Update highlight video. Attend prospect camps at target schools. Begin an introductory email to college coaches (not required but strategic) |
| **11th Grade (Junior Year)** | **THE CRITICAL YEAR.** Coaches can now initiate direct contact (calls, texts, DMs). Official and unofficial visits begin. Verbal commitments start occurring | Narrow target list to 15-20 schools. Send personalized emails to coaches with updated video + academic transcript. Attend prospect days/camps at target schools. Take official visits (limited to 5 per NCAA rules). Verbal commitments are NON-BINDING |
| **12th Grade (Senior Year)** | National Letter of Intent (NLI) signing. Early Signing Period (November) or Regular Signing Period (February for most sports) | Sign NLI during appropriate signing period. Complete NCAA Eligibility Center paperwork. Apply for admission (separate from NLI in some cases). Maintain grades — NCAA has minimum core GPA requirements (2.3 for D1) |

### Dead Periods, Quiet Periods, and Contact Rules

- **Dead Period:** No in-person contact or campus visits. Coaches can call/email but can't meet you
- **Quiet Period:** Coaches can meet on CAMPUS ONLY (you can visit, they can't come to you)
- **Contact Period:** Full contact — coaches can visit you, call you, attend your games
- **Evaluation Period:** Coaches can watch you play but can't talk to you at the venue

These periods vary by sport and change periodically. Check the NCAA website for current sport-specific calendars.

### The Coach Email Template

When a student athlete initiates contact with a college coach, the email should include:

```
Subject: [Your Name] | [Position/Event] | Class of [Year] | [Club/High School]

Dear Coach [Name],

My name is [Full Name], and I am a [position/event] at [High School/Club] in
[City, State]. I am interested in [University Name] because [1 specific
academic or athletic reason].

Academic Profile: GPA [X.X UW] | SAT [XXXX] / ACT [XX]
Athletic Profile: [Key stats — times, averages, rankings]
Video: [Link to highlight reel — YouTube or Hudl]

I would welcome the opportunity to learn more about your program and visit campus.

Thank you for your time,
[Full Name]
[Phone Number]
[Email]
[Club/HS Coach Name and Contact]
```

**Critical:** The academic profile goes BEFORE the athletic profile. Coaches at selective schools screen academics first.

---

## MODULE 4: HOW ATHLETIC RECRUITMENT CHANGES THE SCHOOL-LIST-BUILDER

### Integration with `school-list-builder.md`

When the student is a recruited athlete (or seeking recruitment), the 2-2-2-2-2 framework is MODIFIED:

**Modified probability model:**
- A recruited athlete on a coach's list has a **50-80% admission probability** at schools with <10% general acceptance rates
- This fundamentally changes the Moonshot/High Reach/Match/Safety classification
- A school that would be a "Moonshot" for a non-athlete becomes a "High Reach" or even "Match" for a recruited athlete

**Modified list structure:**

| Tier | For Recruited Athletes |
|------|----------------------|
| **2 Recruitment Targets** (replaces Moonshots) | Schools where the student has active coach interest AND the academic profile meets the AI floor (for Ivies) or general admission standards |
| **2 High Reaches** | Schools where the student has sent the coach email but no confirmed interest yet |
| **2 Academic Matches** | Schools where the student fits academically AND athletically but doesn't need recruitment to gain admission |
| **2 Financial Safeties** | Same as standard model — must include schools with guaranteed admission AND funding |
| **2 Wildcards** | Same as standard model — but one Wildcard could be a D3 academic school where the student walks on |

**The insurance requirement:** Because athletic recruitment can collapse (injury, coaching change, roster needs shift), **every recruited athlete's list must include at least 3 schools where they would gain admission WITHOUT athletic recruitment.** This is the safety net.

### D3 Strategy: The Academic Athlete Play

For academically strong athletes who are good but not D1/D2 scholarship-level:

D3 schools offer NO athletic scholarships, but coaches can and do advocate for admission. At selective D3 schools (Williams, Amherst, Middlebury, Bowdoin, Pomona, CMU, Emory, WashU, NYU, Tufts, Chicago), a coach's support can be the difference between admission and rejection.

**The D3 sweet spot:** A student with a 1480 SAT / 3.85 GPA who is a strong but not elite swimmer may have a 10% chance at Williams as a regular applicant but a 40-60% chance as a recruited D3 athlete. The admissions advantage is real even without scholarship money.

---

## MODULE 5: NCAA ELIGIBILITY REQUIREMENTS

### Core Course Requirements (D1)

NCAA D1 requires 16 core courses completed in high school:

| Subject | Courses Required |
|---------|-----------------|
| English | 4 years |
| Math (Algebra I or higher) | 3 years |
| Natural/Physical Science (including 1 lab) | 2 years |
| Additional English, Math, or Science | 1 year |
| Social Science | 2 years |
| Additional core courses (any above + foreign language, philosophy, etc.) | 4 years |

### Minimum GPA + Test Score Sliding Scale (D1)

NCAA D1 uses a **sliding scale** — lower GPA can be offset by higher test scores and vice versa:

| Core GPA | Minimum SAT | Minimum ACT |
|----------|------------|------------|
| 3.550+ | 400 | 37 |
| 3.000 | 620 | 52 |
| 2.500 | 900 | 68 |
| 2.300 (minimum) | 1010 | 75 |

**Note:** These are MINIMUM eligibility thresholds, not competitive thresholds. A student meeting the minimum is eligible to compete, but selective schools will require far higher academic profiles for recruitment.

### NCAA Eligibility Center Registration

- **When to register:** Beginning of junior year at the latest (earlier is better)
- **Website:** eligibilitycenter.org
- **Cost:** ~$90 (fee waivers available)
- **What's needed:** SSN, high school transcript, SAT/ACT scores (send directly from testing agency)
- **The SLM should remind ALL student-athletes to register** regardless of whether they've been contacted by coaches

---

## CROSS-REFERENCE MAP

| Brain | Relationship |
|-------|-------------|
| `school-list-builder.md` | MODULE 4 modifies the 2-2-2-2-2 framework for recruited athletes. The school-list-builder's Edge Case 6 (Recruited Athlete) now routes to this brain |
| `admissions-strategic-playbook.md` | ED/EA timing may be modified by recruitment timelines. Early signing period is November for most sports |
| `test-prep-strategic-brain.md` | SAT/ACT is critical for Ivy AI calculation and NCAA eligibility. Athletes should NOT go test-optional at Ivies |
| `institutional-dna-*` (all DNA brains) | Each school entry should be cross-referenced for whether the school is D1, D2, or D3, and what sports are strong |
| `extracurricular-spike.md` | Athletics at a high level IS a spike. Tier 1 Apex for nationally recruited athletes; Tier 2 Regional Distinction for strong D3 candidates |
| `financial-aid-brain.md` | Athletic scholarships interact with need-based and merit aid. At D1 schools, athletic scholarships may reduce need-based aid |
| `compliance-brain.md` | **THE SHIELD** — Wayfinder does not guarantee recruitment outcomes or athletic scholarship offers |
