# Wayfinder SLM Training Data Schema
## Entity Types and Field Definitions

### 1. University Profile
```json
{
  "name": "University of Washington",
  "type": "public|private|community",
  "location": { "city": "Seattle", "state": "WA", "region": "Pacific Northwest" },
  "enrollment": { "total": 47400, "undergraduate": 32000, "graduate": 15400 },
  "acceptance": {
    "overall_rate": 0.53,
    "ed_rate": null,
    "ea_rate": null,
    "rd_rate": null,
    "ed_advantage": null
  },
  "academics": {
    "notable_programs": ["Computer Science", "Engineering", "Business"],
    "program_rankings": { "Computer Science": 6, "Engineering": 15 },
    "student_faculty_ratio": "21:1",
    "average_class_size": null,
    "research_expenditure": "$1.6B"
  },
  "admissions_strategy": {
    "decision_types": ["RD"],
    "decision_dates": { "rd_notification": "2026-03-15" },
    "holistic_review": true,
    "test_optional": true,
    "important_factors": ["GPA", "Rigor", "Essays"],
    "school_within_school": {
      "engineering": { "acceptance_rate": 0.25, "notes": "Direct admit is highly competitive" },
      "cs": { "acceptance_rate": 0.15, "notes": "Most competitive program" }
    }
  },
  "demographics": {
    "source": "IPEDS",
    "year": 2023,
    "school_aggregate": {},
    "by_major": {}
  },
  "costs": {
    "tuition_in_state": 12076,
    "tuition_out_state": 38796,
    "room_board": 14220,
    "avg_financial_aid": 17500,
    "avg_net_price": 21000
  },
  "outcomes": {
    "graduation_rate_4yr": 0.72,
    "graduation_rate_6yr": 0.84,
    "avg_starting_salary": 65000,
    "employment_rate_6mo": 0.89,
    "top_employers": ["Amazon", "Microsoft", "Boeing", "Meta"],
    "grad_school_rate": 0.28
  },
  "campus_life": {
    "setting": "urban",
    "greek_life_pct": 0.15,
    "notable_clubs": [],
    "athletics": "NCAA Division I (Pac-12)",
    "housing_guarantee": "Freshmen guaranteed"
  },
  "internship_pipeline": {
    "co_op_available": false,
    "notable_partnerships": ["Amazon", "Boeing", "Microsoft"],
    "career_center_rating": "strong"
  },
  "wayfinder_insight": "Strategic notes distilled from admissions research"
}
```

### 2. High School Profile
```json
{
  "name": "Lakeside School",
  "type": "private|public|charter|magnet",
  "location": { "city": "Seattle", "state": "WA", "district": "Independent" },
  "grades": "5-12",
  "enrollment": 850,
  "demographics": {
    "white_pct": 0.45,
    "asian_pct": 0.25,
    "hispanic_pct": 0.10,
    "black_pct": 0.08,
    "other_pct": 0.12
  },
  "academics": {
    "ap_courses_offered": 22,
    "ap_courses_list": ["AP Calculus BC", "AP Physics C", "AP CS A"],
    "ib_program": false,
    "average_sat": 1450,
    "average_act": 33,
    "student_teacher_ratio": "9:1",
    "college_counselors": 4,
    "counselor_student_ratio": "1:50"
  },
  "college_placement": {
    "four_year_college_rate": 0.99,
    "top_matriculations": [
      {"school": "University of Washington", "count": 25, "year": 2024},
      {"school": "Stanford University", "count": 5, "year": 2024}
    ],
    "ivy_plus_rate": 0.15,
    "notable_placements": "Strong placement at UW, Stanford, Ivies"
  },
  "extracurriculars": {
    "notable_clubs": ["Robotics", "Debate", "Model UN"],
    "athletics": ["Soccer", "Basketball", "Tennis", "Track"],
    "arts_programs": ["Orchestra", "Theater", "Visual Arts"],
    "community_service": "Required 40 hours"
  },
  "culture": {
    "description": "Academically rigorous with emphasis on independent thinking",
    "strengths": ["STEM", "Computer Science", "Critical Thinking"],
    "notable_alumni": ["Bill Gates (attended)"],
    "tuition": 42000,
    "financial_aid_available": true
  },
  "wayfinder_insight": "Strategic notes for families considering this school"
}
```

### 3. College Consulting Firm Profile
```json
{
  "name": "IvyWise",
  "website": "ivywise.com",
  "location": "New York, NY",
  "type": "boutique|large|online|hybrid",
  "pricing": {
    "range": "$5,000-$50,000+",
    "structure": "package-based",
    "most_popular_package": "$15,000"
  },
  "services": [
    "School selection",
    "Essay coaching",
    "Application strategy",
    "Interview prep"
  ],
  "methodology": "Description of their approach",
  "claims": ["95% acceptance to top choice school"],
  "team_size": "50+ counselors",
  "specializations": ["Ivy League", "Top 20"],
  "notable_counselors": [],
  "strengths": [],
  "weaknesses": [],
  "wayfinder_differentiation": "How Wayfinder's approach differs/improves"
}
```

### 4. Graduate Program Profile
```json
{
  "name": "Stanford MBA",
  "university": "Stanford University",
  "degree": "MBA",
  "field": "Business",
  "acceptance_rate": 0.06,
  "enrollment": 850,
  "avg_gmat": 738,
  "avg_gpa": 3.73,
  "tuition_total": 235000,
  "avg_starting_salary": 175000,
  "employment_rate": 0.95,
  "top_industries": ["Tech", "Consulting", "Finance"],
  "top_employers": ["Google", "McKinsey", "Goldman Sachs"],
  "wayfinder_insight": "Strategic notes"
}
```

## Data Collection Priority
1. **P0 (immediate)**: All WA state universities, top 30 WA high schools, top 100 US universities
2. **P1 (next)**: Top 30 consulting firms, Ivy+ detailed profiles, top feeder high schools nationally
3. **P2 (later)**: All US 4-year colleges, graduate programs, middle schools, international
