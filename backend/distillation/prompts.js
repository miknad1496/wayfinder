/**
 * WAYFINDER KNOWLEDGE DISTILLATION — PROMPT TEMPLATES
 *
 * These are the "training queries" sent to Opus 4.6 to synthesize
 * deep career intelligence. Each prompt is designed to force Opus
 * to reason, cross-reference, and produce insights that go far
 * beyond what raw data provides.
 *
 * Architecture:
 *   Layer 1: Career Pathway Maps (cross-referenced transitions)
 *   Layer 2: Decision Frameworks (how to think, not just facts)
 *   Layer 3: ROI Analysis (certifications, education, bootcamps)
 *   Layer 4: Industry Intelligence (trends, red flags, contrarian takes)
 *   Layer 5: Real-World Playbooks (actionable step-by-step guides)
 *   Layer 6: Audience-Specific Guidance (by student type / life stage)
 */

// ============================================================
// LAYER 1: CAREER PATHWAY MAPS
// ============================================================
const careerPathwayPrompts = [
  {
    id: 'pathway-tech-transitions',
    layer: 'career-pathways',
    title: 'Tech Career Transition Map',
    prompt: `You are building a career intelligence system. Analyze the most common and successful career transitions INTO tech from non-tech backgrounds.

For each transition path, provide:
1. The origin career/background
2. The specific tech roles they typically land in (not just "software engineer")
3. The bridge skills that transfer (be specific — not generic "problem solving")
4. The realistic timeline and what it actually takes
5. The salary trajectory (year 1, year 3, year 5) with realistic ranges, not median hype
6. The failure modes — why people fail at this transition and what the dropout rate looks like
7. One contrarian insight that career advisors usually get wrong about this path

Cover these specific transitions:
- Liberal arts → tech
- Healthcare → health tech
- Finance/accounting → fintech
- Teaching → EdTech / instructional design
- Military → tech (which branches/MOS translate best)
- Retail/service → tech support → engineering pipeline
- Law → legal tech / compliance tech

Format as structured markdown with clear headers per transition path.`
  },
  {
    id: 'pathway-non-degree',
    layer: 'career-pathways',
    title: 'Non-Degree Career Paths That Actually Pay',
    prompt: `Analyze career paths that do NOT require a 4-year degree but have realistic earning potential above $60K within 5 years.

For each path, provide:
1. The specific role (not vague categories)
2. What training/certification is actually needed (be specific about programs, costs, time)
3. Realistic year-1 salary in different markets (not just national median — break down by HCOL/MCOL/LCOL)
4. The career ceiling — where does this path max out without a degree?
5. The upgrade path — if they later want to break the ceiling, what's the most efficient move?
6. Demand trajectory — is this growing, stable, or at risk from AI/automation?
7. The "hidden" version — a variant of this role most people don't know about that pays better

Cover: skilled trades (be specific — which ones), tech certifications, healthcare non-degree, government pathways, sales/business development, creative/digital.

Be brutally honest. If a path is overhyped (like "learn to code in 12 weeks and make $120K"), say so and explain the reality.

Format as structured markdown.`
  },
  {
    id: 'pathway-career-pivots-30s',
    layer: 'career-pathways',
    title: 'Career Pivot Playbook for Late Starters',
    prompt: `Many career changers are in their late 20s or 30s with financial obligations. The standard career advice doesn't account for this reality.

Analyze the most viable career pivots for people who:
- Can't afford to go back to school full-time
- Need to maintain income during transition
- Have 5-10 years of work experience in their current field
- May have families, mortgages, or other financial constraints

For each viable pivot:
1. The "bridge strategy" — how to transition without a gap in income
2. Which existing experience is actually valuable (not the cliché "transferable skills")
3. The minimum viable credential — what's the smallest investment that opens the door?
4. How to position yourself against younger candidates with "native" backgrounds
5. The realistic timeline from "I want to switch" to "I'm employed in the new field"
6. What to tell interviewers about the switch (and what NOT to say)

Focus on pivots with the highest success rates based on what actually happens in the market, not what LinkedIn influencers claim.

Format as structured markdown.`
  },
  {
    id: 'pathway-stem-vs-non-stem',
    layer: 'career-pathways',
    title: 'STEM vs Non-STEM: The Real ROI Analysis',
    prompt: `There's a pervasive narrative that STEM = good career, non-STEM = bad career. This is an oversimplification that hurts students.

Provide a nuanced analysis:

1. Which STEM degrees actually deliver on the salary promise, and which don't? (Biology majors often earn less than business majors — why?)
2. Which non-STEM degrees have surprisingly strong outcomes? (Economics, statistics-adjacent social sciences, certain design degrees)
3. The "STEM premium" — does it hold up when you control for selectivity of the institution?
4. The hidden factor: field of study matters less than what you DO with it. Provide specific examples.
5. Double-major and minor strategies that maximize optionality
6. The graduate school trap — when a masters/PhD HELPS vs HURTS lifetime earnings
7. The role of internships, co-ops, and work experience — when does this matter MORE than the degree itself?

Use actual data where possible (BLS, NCES, Georgetown CEW studies). When you're reasoning beyond the data, say so explicitly.

Format as structured markdown with clear section headers.`
  },
  {
    id: 'pathway-ai-disruption-map',
    layer: 'career-pathways',
    title: 'AI Disruption Map: Which Careers Are Safe, Threatened, and Transformed',
    prompt: `Map the AI disruption landscape for career planning as of 2025-2026.

Categorize careers into:

**AUGMENTED (AI makes you more productive, not replaced):**
- List specific roles and explain HOW AI augments them
- What skills become MORE valuable because of AI?

**DISRUPTED (significant job loss likely within 5-10 years):**
- List specific roles with honest assessment
- What's the timeline? What are the early warning signs?
- What should people currently in these roles do NOW?

**CREATED (new roles that didn't exist or barely existed before AI):**
- List emerging roles with realistic salary ranges
- What training/background prepares you best?
- Which of these are real vs. hype?

**IMMUNE (AI has minimal impact for structural reasons):**
- List roles and explain WHY they're protected
- Physical presence requirements, regulatory barriers, human trust factors

For each category, go beyond the obvious. Everyone knows "truck drivers at risk" — provide deeper analysis. What about middle management? Junior lawyers? Financial analysts? Content writers? Radiologists?

Also address: the skills that are AI-proof regardless of field. What should EVERY student invest in?

Format as structured markdown.`
  }
];

// ============================================================
// LAYER 2: DECISION FRAMEWORKS
// ============================================================
const decisionFrameworkPrompts = [
  {
    id: 'framework-major-selection',
    layer: 'decision-frameworks',
    title: 'How to Choose a College Major (Decision Framework)',
    prompt: `Create a comprehensive decision framework for choosing a college major. This should NOT be a list of majors — it should teach students HOW TO THINK about the decision.

Include:

1. **The 3x3 Matrix**: Map your (interests × abilities × market demand). How to honestly assess each dimension.

2. **The Optionality Principle**: Which majors keep the most doors open? Quantify this — a CS degree opens X career categories, a Philosophy degree opens Y, but Philosophy + minor in data science opens Z.

3. **The Regret Minimization Framework**: How to think about this decision in terms of future regret, not present excitement. What does the research say about how people feel about their major 10 years later?

4. **The Financial Reality Check**: A specific calculator/framework for weighing expected debt against expected earnings. Include the often-ignored variables (geographic market, institutional prestige, internship access).

5. **The "Two Paths" Test**: For students torn between two options, a structured way to evaluate both without analysis paralysis.

6. **When to Ignore the Framework**: Cases where passion/calling genuinely should override market data (and how to do it responsibly — e.g., pursue music but with a business minor as insurance).

7. **Red Flags**: Signs you're choosing a major for the wrong reasons (parental pressure, peer influence, a single inspiring class).

Make this practical and specific. A student should be able to sit down with this framework and make meaningful progress on their decision in one session.

Format as structured markdown.`
  },
  {
    id: 'framework-salary-negotiation',
    layer: 'decision-frameworks',
    title: 'Salary Negotiation Intelligence',
    prompt: `Build a comprehensive salary negotiation guide specifically for people early in their careers (0-7 years experience).

Include:

1. **How salary bands actually work** at companies — what's the real structure behind offers?
2. **The research phase**: Exactly how to determine your market rate (which sources to trust, which to ignore, how to adjust for location/company size/industry)
3. **The psychology**: What's actually happening in the hiring manager's mind during negotiation? What levers do they have?
4. **Script templates** for:
   - Responding to "What are your salary expectations?"
   - Countering an initial offer
   - Negotiating when you have competing offers
   - Negotiating when you DON'T have competing offers
   - Negotiating non-salary compensation (equity, signing bonus, remote work, title)
5. **Mistakes that actually cost people money** — not generic advice, specific tactical errors
6. **The gender/race negotiation gap**: Research-backed strategies for women and minorities who face documented bias in negotiation
7. **When NOT to negotiate** — yes, there are times. When and why.
8. **First job specific**: How negotiation works differently when you have zero leverage (new grad, career changer)

Ground everything in what actually happens in hiring, not motivational negotiation theory.

Format as structured markdown.`
  },
  {
    id: 'framework-should-i-go-to-grad-school',
    layer: 'decision-frameworks',
    title: 'Graduate School Decision Framework',
    prompt: `Create a rigorous decision framework for "Should I go to graduate school?"

This is one of the most consequential (and often poorly-made) career decisions. Cover:

1. **The NPV calculation**: How to actually model the financial impact of grad school. Include opportunity cost (not just tuition). Provide the formula and walk through examples for MBA, law school, medical school, masters in CS, masters in education, PhD in humanities.

2. **When grad school has POSITIVE ROI** — specific scenarios with data
3. **When grad school has NEGATIVE ROI** — the traps people fall into
4. **The "credential vs. knowledge" test**: Are you going for the credential (sometimes rational) or the knowledge (often available cheaper elsewhere)?
5. **The timing question**: Right after undergrad vs. 2-5 years of work experience. When does each path make sense?
6. **Program selectivity matters more than people think**: The ROI difference between a top-20 MBA and a bottom-100 MBA is enormous. Quantify this.
7. **Funded vs. unfunded**: If you can't get funding for a PhD, what does that signal?
8. **The sunk cost danger**: How to recognize when you should leave a program that's not working

Be direct and data-driven. Many grad school decisions are driven by fear of the job market or "default path" thinking — call this out.

Format as structured markdown.`
  },
  {
    id: 'framework-job-offer-evaluation',
    layer: 'decision-frameworks',
    title: 'How to Evaluate a Job Offer Beyond Salary',
    prompt: `Create a comprehensive framework for evaluating job offers that goes far beyond the salary number.

Include a scoring system across these dimensions:

1. **Total compensation** (base, bonus, equity, benefits — how to value each, especially equity at startups vs. public companies)
2. **Career trajectory** (will this job make you more or less employable in 2-3 years? How to assess a role's "resume value")
3. **Learning velocity** (how fast will you grow? The manager question — why your direct manager matters more than the company brand)
4. **Company trajectory** (growing vs. declining industry, startup stage, competitive position)
5. **Culture signals** (how to read Glassdoor correctly, what to look for in the interview process, red flags)
6. **Work-life reality** (how to get honest information about hours and expectations)
7. **Geographic/remote considerations** (the real cost of living adjustment most people get wrong)
8. **The "2 AM test"** — would you be proud to work on this company's problems?

Provide a weighted scoring template a student could actually use to compare 2-3 offers side by side.

Format as structured markdown.`
  }
];

// ============================================================
// LAYER 3: ROI ANALYSIS
// ============================================================
const roiAnalysisPrompts = [
  {
    id: 'roi-certifications',
    layer: 'roi-analysis',
    title: 'Certification ROI Rankings by Career Stage',
    prompt: `Rank the most impactful professional certifications by actual career ROI, segmented by career stage (entry-level, mid-career, senior).

For each certification:
1. The real cost (exam + study materials + time investment in hours)
2. The salary bump — what data actually shows, not what the cert body claims
3. The "door-opener" factor — does this get you interviews you wouldn't otherwise get?
4. Shelf life — how long before this becomes outdated or commoditized?
5. Stacking strategy — which certs combine well? What's the optimal order?
6. The DIY alternative — can you get 80% of the value without the formal cert?

Cover:
- Tech: AWS Solutions Architect, Google Cloud, Azure, CompTIA, CISSP, Kubernetes (CKA)
- Project Management: PMP, Scrum Master, Six Sigma
- Data: Google Data Analytics, IBM Data Science, Tableau
- Finance: CFA, CPA, CFP, Series 7/66
- HR: SHRM, PHR
- Healthcare: various nursing certs, coding certs
- Trades: specific high-value trade certs

Be honest about which certs are resume padding vs. genuinely valuable.

Format as structured markdown with clear tier rankings.`
  },
  {
    id: 'roi-bootcamps',
    layer: 'roi-analysis',
    title: 'Coding Bootcamp Reality Check',
    prompt: `Provide an honest, data-grounded analysis of coding bootcamps as a career investment in 2025-2026.

Cover:
1. **Actual outcomes data** — what do CIRR-reported bootcamps show vs. what marketing claims? Break down placement rates, salary ranges, and the asterisks on those numbers.
2. **Which bootcamps for which goals**: Web dev, data science, cybersecurity, UX — what are the actual top programs in each and why?
3. **The $15K-$20K bootcamp vs. free/cheap alternatives** — when is it worth paying and when isn't it? (freeCodeCamp, Odin Project, CS50, etc.)
4. **ISA (Income Share Agreement) analysis** — the math on whether these are a good deal or predatory
5. **The post-bootcamp reality**: The job search typically takes 3-6 months, not the "hired in 2 weeks" the brochures show. What does this period actually look like?
6. **Who bootcamps work best for** (and who they DON'T work for — this matters)
7. **The AI factor**: How has AI (Copilot, ChatGPT) changed what bootcamp grads need to know? Are bootcamps updating their curricula fast enough?
8. **The hiring manager's perspective**: How do bootcamp grads actually get evaluated vs. CS degree holders?

No sugarcoating. Bootcamps work for some people and are expensive failures for others — help students figure out which category they fall into.

Format as structured markdown.`
  },
  {
    id: 'roi-college-alternatives',
    layer: 'roi-analysis',
    title: 'College Alternatives: Honest ROI Comparison',
    prompt: `Compare the major post-high-school pathways with honest ROI analysis:

1. **4-year university** (segment by: elite private, state flagship, regional state, open-admission)
2. **Community college → transfer** (the actual success rates and pitfalls)
3. **Trade school / apprenticeship** (which trades, realistic earnings, career trajectory)
4. **Military → GI Bill pathway** (break down by branch, the real benefits and costs)
5. **Direct to workforce** (which industries, what's the ceiling without credentials?)
6. **Bootcamp / certificate programs** (for which fields is this viable?)
7. **Gap year → entrepreneurship** (the realistic version, not the TikTok version)

For each pathway:
- 5-year and 10-year expected earnings (with realistic ranges, not just medians)
- Total investment (money AND time — opportunity cost matters)
- Risk profile (what's the downside scenario?)
- Optionality (does this path keep doors open or close them?)
- Who this is BEST for (personality, goals, financial situation)
- The biggest misconception about this path

Be especially careful about survivorship bias — the "I dropped out and became a billionaire" narrative vs. the statistical reality.

Format as structured markdown.`
  }
];

// ============================================================
// LAYER 4: INDUSTRY INTELLIGENCE
// ============================================================
const industryIntelPrompts = [
  {
    id: 'intel-tech-landscape',
    layer: 'industry-intel',
    title: 'Tech Industry Career Landscape 2025-2027',
    prompt: `Provide a strategic analysis of the tech industry job market for career planning (2025-2027).

Cover:
1. **The post-layoff reality**: What does tech hiring actually look like now? Which segments are growing vs. contracting?
2. **The new tech career tiers**: Big Tech (FAANG+), mid-market, startups, enterprise, government tech — how do comp and culture differ?
3. **Hot vs. overhyped roles**: AI/ML engineer (real demand or hype cycle?), platform engineer, security, data engineering, product management
4. **The junior developer squeeze**: How hard is it really to break into tech as an entry-level person right now? What's changed?
5. **Remote work reality**: Which companies actually went back to office? What's the salary adjustment for remote?
6. **The startup equity lottery**: Realistic analysis of startup compensation — when is equity worth something?
7. **Non-engineering tech roles that pay well** but get less attention: Solutions architect, developer relations, technical program manager, sales engineering
8. **The geographic arbitrage play**: Where are the best opportunities for each career stage?

Write for someone making career decisions, not for investors. Be specific with numbers.

Format as structured markdown.`
  },
  {
    id: 'intel-healthcare-careers',
    layer: 'industry-intel',
    title: 'Healthcare Career Landscape and Strategy',
    prompt: `Analyze the healthcare career landscape for career planning.

Cover:
1. **Beyond "become a doctor"**: The full spectrum of healthcare careers by education level (certificate → associates → bachelors → graduate)
2. **The nursing reality**: Demand is real, but which specialties? What does the pay progression actually look like? Travel nursing — still viable or bubble burst?
3. **Healthcare tech convergence**: Health informatics, medical coding, telehealth, clinical data science — where's the real growth?
4. **The PA/NP vs. MD decision**: Honest analysis of lifestyle, earnings, education cost, and career satisfaction data
5. **Allied health careers people overlook**: Radiation therapy, respiratory therapy, occupational therapy, diagnostic imaging — the ROI on these is often excellent
6. **The burnout factor**: Which healthcare careers have the highest satisfaction? The highest burnout? How should this factor into career planning?
7. **Geographic demand patterns**: Where are healthcare workers needed most? How does this affect compensation?
8. **AI in healthcare**: What's automatable and what isn't? How should students prepare?

Be specific about training requirements, timelines, and costs. A student reading this should be able to identify their best-fit path.

Format as structured markdown.`
  },
  {
    id: 'intel-finance-careers',
    layer: 'industry-intel',
    title: 'Finance and Business Career Intelligence',
    prompt: `Analyze finance and business career paths with strategic depth.

Cover:
1. **Investment banking / consulting**: The reality behind the prestige. Hours, pay progression, exit opportunities. When is this worth it?
2. **Corporate finance (FP&A, treasury, accounting)**: The stable path — career ceiling, progression timeline, automation risk
3. **Fintech disruption**: Which traditional finance roles are being disrupted? Which new roles are emerging?
4. **The CPA path**: Still worth it? How is automation changing accounting? Where's the value shifting?
5. **Financial planning / wealth management**: The fee compression issue, robo-advisors, and where human advisors still have an edge
6. **Business operations / strategy roles**: What people actually DO in these roles (not the LinkedIn descriptions)
7. **Sales and business development**: The highest-ceiling path most college students ignore. Why B2B sales can out-earn most "prestigious" paths.
8. **The MBA question**: When it makes sense, when it's a $200K mistake, and what to do instead

Provide specific compensation data at different career stages. Compare paths honestly — many students default to "prestigious" paths when higher-earning, higher-satisfaction alternatives exist.

Format as structured markdown.`
  },
  {
    id: 'intel-trades-renaissance',
    layer: 'industry-intel',
    title: 'Skilled Trades: The Hidden Opportunity',
    prompt: `The skilled trades are experiencing a generational shift. Provide deep analysis for career planning.

Cover:
1. **The supply crisis**: Why there's a massive shortage and what this means for earning potential over the next decade
2. **Trade-by-trade breakdown**: Electrician, plumber, HVAC, welding, elevator mechanic, lineman, industrial maintenance — realistic earnings at apprentice/journeyman/master levels
3. **The entrepreneur angle**: How tradespeople build businesses. The path from apprentice → journeyman → own shop → multiple crews is one of the most reliable wealth-building paths in America.
4. **Union vs. non-union**: Honest comparison of pay, benefits, training quality, career protection
5. **The physical reality**: These jobs have physical demands. What does career longevity look like? Injury rates? How do people plan for this?
6. **Women and minorities in trades**: Current landscape, programs that support entry, real challenges and how to navigate them
7. **The "college or trades" false binary**: Why this framing is wrong — many people do both or sequence them
8. **Emerging trades**: Solar installation, EV infrastructure, data center construction, smart home technology — where's the new growth?

Fight the stigma with data. A master electrician who starts at 18 often has a higher lifetime net worth than a college grad who starts at 22 with $80K in debt.

Format as structured markdown.`
  },
  {
    id: 'intel-government-federal',
    layer: 'industry-intel',
    title: 'Government and Public Sector Career Strategy',
    prompt: `Government careers are deeply misunderstood. Provide strategic career intelligence.

Cover:
1. **Total compensation reality**: Base salary is lower, but factor in pension, TSP match, health benefits, job security, and the actual gap is much smaller (sometimes zero) for many roles
2. **The GS scale decoded**: How federal pay grades work, locality adjustments, within-grade increases, and realistic career progression timelines
3. **High-value federal career paths**: Cybersecurity (DHS, NSA), intelligence community, federal law enforcement, FDA/EPA scientists, military civilian roles
4. **Pathways for students**: Internship programs, Recent Graduates, PMF (Presidential Management Fellows) — how competitive are these really?
5. **USAJobs decoded**: How the federal hiring process actually works (it's opaque by design). Tips for getting through the system.
6. **State and local government**: Often overlooked but can be excellent — especially for quality of life. Which roles and agencies?
7. **The PSLF play**: Public Service Loan Forgiveness — how to structure a career around this. The math on when it's a smart financial strategy.
8. **Government → private sector**: The "revolving door" — which government experience is most valued in the private sector?

Write this for someone who hasn't considered government and might be surprised at the opportunity.

Format as structured markdown.`
  }
];

// ============================================================
// LAYER 5: REAL-WORLD PLAYBOOKS
// ============================================================
const playbookPrompts = [
  {
    id: 'playbook-first-job',
    layer: 'playbooks',
    title: 'First Job Playbook: The First 90 Days and Beyond',
    prompt: `Create a comprehensive playbook for navigating your first professional job.

Cover:
1. **Before day 1**: What to do in the gap between accepting and starting (reading, preparation, wardrobe, logistics)
2. **First 30 days**: The "learning mode" strategy. How to build relationships, understand org dynamics, avoid common mistakes
3. **Days 30-90**: The "adding value" transition. How to identify quick wins, build credibility, find your first meaningful project
4. **The manager relationship**: How to manage up effectively. What your manager actually cares about. How to get useful feedback.
5. **Office politics 101**: This exists everywhere — how to navigate without being political. The alliances that matter.
6. **The performance review game**: How reviews actually work. How to set yourself up for a strong first review.
7. **When to start looking at "what's next"**: The tenure question — how long should you stay in your first job? When is it okay to leave?
8. **Remote/hybrid specific**: How to succeed when you're not physically present. Building visibility without being annoying.
9. **Mistakes that are OK to make** (and ones that aren't). Give students permission to be human while protecting them from career-damaging errors.

Write in a direct, practical voice. A new grad should be able to reference this document throughout their first year.

Format as structured markdown.`
  },
  {
    id: 'playbook-networking',
    layer: 'playbooks',
    title: 'Networking That Actually Works (Not the Cringe Version)',
    prompt: `Create a practical networking guide that acknowledges most networking advice is uncomfortable and ineffective.

Cover:
1. **Why "just network more" is bad advice** and what actually works
2. **The introvert's playbook**: Networking strategies for people who don't enjoy schmoozing (this is most people)
3. **Informational interviews**: The exact script (what to ask, how to ask, how to follow up). What makes someone say yes vs. ignore you.
4. **LinkedIn done right**: What actually gets noticed vs. what's cringe. How to build a profile that attracts recruiters. The content game — is posting on LinkedIn worth it?
5. **The "warm intro" strategy**: How to get introduced to people through existing connections
6. **Conference and event strategy**: How to work a room if you're not a natural extrovert
7. **The long game**: How to maintain relationships without being transactional (the key insight most networking advice misses)
8. **Mentorship**: How to find mentors without awkwardly asking "will you be my mentor?" What actually makes a mentorship work.
9. **The reciprocity principle**: How to be useful to people above your career level (yes, it's possible)
10. **Cold outreach that works**: Templates for reaching out to strangers that actually get responses

Kill the "networking is about collecting business cards" mindset. Replace it with genuine relationship building that happens to advance your career.

Format as structured markdown.`
  },
  {
    id: 'playbook-interview',
    layer: 'playbooks',
    title: 'Interview Mastery Playbook',
    prompt: `Create a comprehensive interview preparation system — not generic "tell me about yourself" advice, but deep strategic preparation.

Cover:
1. **The research framework**: Exactly what to research about a company and how to use it in the interview (most candidates under-prepare here)
2. **Behavioral interview system**: The STAR method is table stakes. Go deeper — how to identify which stories to prepare, how to adapt them on the fly, the "so what" principle.
3. **Technical interview strategy**: By field (tech, finance, consulting, marketing) — what's actually being tested and how to prepare efficiently
4. **Case interviews**: The prep strategy for consulting/strategy roles
5. **The "culture fit" assessment**: What interviewers actually mean by this and how to demonstrate it authentically
6. **Questions to ask the interviewer**: The questions that actually tell you something useful AND impress the interviewer
7. **Handling curveball questions**: "Tell me about a failure" / "Where do you see yourself in 5 years" / "Why should we hire you" — strategic answers that sound natural
8. **Salary discussion during interviews**: When it comes up, what to say, what NOT to say
9. **Panel interviews, group interviews, presentation interviews**: Specific strategies for each format
10. **After the interview**: Follow-up strategy that actually influences the decision

Make this actionable. Someone reading this should be able to build a complete interview preparation plan in one sitting.

Format as structured markdown.`
  }
];

// ============================================================
// LAYER 6: AUDIENCE-SPECIFIC GUIDANCE
// ============================================================
const audiencePrompts = [
  {
    id: 'audience-high-school-undecided',
    layer: 'audience-guidance',
    title: 'For High School Students Who Have No Idea What They Want to Do',
    prompt: `Write a comprehensive guide specifically for high school students (ages 15-18) who feel overwhelmed by the "what do you want to be?" question.

Cover:
1. **Normalize the uncertainty**: Most adults changed their path multiple times. The pressure to "know" at 17 is unreasonable and historically new.
2. **Exploration strategies**: Specific, low-cost ways to test career interests while still in high school (job shadowing, volunteering, online courses, projects)
3. **The "skills over titles" framework**: Instead of choosing a career, identify skills you want to build. These are more durable than job titles.
4. **College planning without a major in mind**: How to choose a school that supports exploration. Which schools have the best undecided/exploratory programs?
5. **The gap year option**: When it makes sense, how to structure it productively, how it looks to colleges and employers
6. **Parental pressure navigation**: How to have the conversation with parents who want you to be a doctor/lawyer/engineer
7. **The myth of the "perfect fit"**: Research shows career satisfaction comes more from autonomy, mastery, and purpose than from finding the "right" career
8. **Practical next steps**: A 30-day exploration plan a high schooler can actually execute

Write in a voice that's warm but not condescending. These students are smart — they're just facing an impossible question with limited information.

Format as structured markdown.`
  },
  {
    id: 'audience-first-gen',
    layer: 'audience-guidance',
    title: 'First-Generation College Student Career Guide',
    prompt: `Create a career guide specifically for first-generation college students — those whose parents didn't attend college and who lack the informal career knowledge that gets passed down in professional families.

Cover:
1. **The hidden curriculum**: Things wealthy/professional-class students learn at the dinner table — workplace norms, networking, how to talk to authority figures, "professional" communication
2. **Financial aid and scholarship strategy**: The money that first-gen students leave on the table because they don't know to look. Specific programs and resources.
3. **Choosing a college strategically**: When prestige matters (it opens networks) and when the affordable option is smarter
4. **Building a professional network from scratch**: When your family doesn't have corporate connections, how do you build them?
5. **Imposter syndrome**: It's real, it's especially intense for first-gen students, and here's how to manage it
6. **Career center usage**: Many first-gen students underuse campus resources. What to ask for, when to go, how to leverage alumni networks.
7. **Industry knowledge**: A primer on how different industries work — corporate hierarchy, how hiring works, what "business casual" means, how to use LinkedIn
8. **Summer strategy**: Internships, research, jobs — how to maximize summers when you might also need to earn money
9. **The money conversation**: How to navigate being in college with wealthier peers. How to make financial decisions about career paths when you may be supporting family.
10. **Mentors who understand**: Where to find mentors who've walked this path (specific programs, organizations, communities)

This should feel like advice from an older sibling who figured it out. Practical, warm, no judgment.

Format as structured markdown.`
  },
  {
    id: 'audience-career-changer',
    layer: 'audience-guidance',
    title: 'Career Changer Intelligence Briefing',
    prompt: `Create comprehensive guidance for adults (25-45) considering a career change.

Cover:
1. **The "should I actually change?" diagnostic**: Sometimes the problem is the job, not the career. How to tell the difference.
2. **The financial runway calculation**: How much savings/income buffer do you actually need? The specific math.
3. **Transition architectures**:
   - The "moonlight" approach: build skills on the side
   - The "bridge role" approach: take an adjacent position that moves you closer
   - The "clean break" approach: when this is the only option and how to survive it
   - The "internal pivot" approach: changing roles within your current company
4. **Age discrimination reality**: It exists. How to mitigate it. How to position experience as an asset.
5. **The skills audit**: How to identify what you actually know that's valuable in a new field (most people underestimate this)
6. **The credentialing question**: Do you need to go back to school? Get a cert? Or can you transition on experience alone?
7. **The identity crisis**: Career changes are emotional. Your identity was tied to your old career. How to navigate this psychologically.
8. **The partner/family conversation**: How to make this decision when others depend on you
9. **Networking into a new field**: Specific strategies for building connections in an industry where you know nobody
10. **The realistic timeline**: Expect 6-18 months. Here's what each phase looks like.

Write for an adult audience. No platitudes. Data and strategy.

Format as structured markdown.`
  }
];

// ============================================================
// LAYER 7: WAYFINDER CORE IDENTITY
// ============================================================
const coreIdentityPrompts = [
  {
    id: 'core-reasoning-principles',
    layer: 'core-identity',
    title: 'Wayfinder Core Reasoning Principles',
    prompt: `You are defining the SOUL of Wayfinder — an AI career advisor. These principles will be injected into every conversation to guide how Wayfinder thinks, reasons, and responds.

This is NOT content for users. This is the advisor's INTERNAL philosophy and judgment framework — the difference between a textbook and a mentor.

Define:

1. **ADVISORY PHILOSOPHY** (7 core principles)
   Example: "We optimize for career optionality over immediate prestige"
   Each needs a 2-3 sentence explanation of WHY and HOW it changes the advice given.

2. **REASONING PATTERNS** (12 patterns)
   The specific thinking steps Wayfinder follows for common question types:
   - "What should I major in?" → assess risk tolerance, financial constraints, interest breadth, then match
   - "Is this job offer good?" → total comp analysis, trajectory assessment, culture signals
   - "Should I go to grad school?" → NPV calculation, credential vs knowledge test, timing analysis
   - Cover at least 12 common question archetypes

3. **CALIBRATION GUIDELINES**
   - When to encourage vs. give a reality check
   - How to handle "my parents want me to be a doctor" conversations
   - When to recommend against the student's stated preference
   - How to be honest without being discouraging
   - How to handle emotional topics (financial stress, imposter syndrome, family pressure)

4. **TONE PRINCIPLES**
   - Wayfinder speaks like a smart, caring older sibling — not a corporate HR bot
   - Specific phrases to USE and AVOID
   - How to modulate formality based on user type (high schooler vs. parent vs. advisor)

5. **KNOWLEDGE HUMILITY**
   - What Wayfinder confidently advises on
   - What it presents as "data suggests, but..."
   - What it explicitly does NOT advise on (legal, medical, financial planning)

6. **ANTI-PATTERNS**
   - Generic advice Wayfinder must NEVER give ("follow your passion", "network more")
   - Templates or clichés to actively avoid
   - How to catch itself being generic and course-correct

This document becomes Wayfinder's personality. Make it specific, opinionated, and deeply thoughtful.

Format as structured markdown.`
  },
  {
    id: 'core-conversation-patterns',
    layer: 'core-identity',
    title: 'Wayfinder Conversation Design Patterns',
    prompt: `Design the conversation patterns that Wayfinder uses to guide students through career exploration.

Create detailed conversation flows for these 8 scenarios:

1. **First-time user onboarding**: How to quickly assess where someone is (high school, college, career changer) and what they need, without feeling like a survey
2. **The "I don't know what I want" conversation**: How to help someone who's completely lost — without overwhelming them
3. **The "my parents want X but I want Y" conversation**: How to navigate family pressure sensitively
4. **The "should I change my major/career?" conversation**: How to help someone who's doubting their path
5. **The "I need a job RIGHT NOW" conversation**: How to be practical when someone needs money, not philosophy
6. **The "compare these options" conversation**: How to help someone evaluate 2-3 concrete choices
7. **The follow-up conversation**: How to build on previous sessions, track progress, push gently
8. **The advisor/counselor conversation**: How to provide value to career counselors who use Wayfinder for their students

For each pattern:
- The opening move (first 2-3 messages)
- Key questions to ask and WHY they matter
- Common pitfalls to avoid
- How to transition from exploration to actionable next steps
- Example dialogue snippets showing the ideal tone

Format as structured markdown with clear headers per pattern.`
  }
];

// ============================================================
// LAYER 8: CROSS-REFERENCED SYNTHESIS
// (These prompts reference scraped data — run AFTER scraping)
// ============================================================
const synthesisPrompts = [
  {
    id: 'synthesis-bls-insights',
    layer: 'synthesis',
    title: 'BLS Data Deep Interpretation',
    prompt: `I'm going to provide you with raw BLS occupational data. Your job is NOT to summarize it — it's to INTERPRET it for career decision-making.

For the occupations in the data:
1. Identify the 10 best "hidden gem" careers — high pay, strong growth, low competition, that most career advisors don't mention
2. Identify the 5 most OVERHYPED careers — popular but the data tells a different story than the narrative
3. Find the "gateway careers" — entry-level roles that lead to the highest ceiling if you play the long game
4. Map the salary-to-education-to-outlook sweet spots — where do you get the most career bang for your educational buck?
5. Identify concerning trends — careers where growth is slowing and students should be cautious
6. Cross-reference: which careers pair well? (e.g., nursing + informatics, accounting + data analysis)

Think like a strategic advisor, not a data reporter.

[SCRAPED BLS DATA WILL BE INJECTED HERE]

Format as structured markdown.`,
    requiresData: true,
    dataSource: 'bls-occupations.json'
  },
  {
    id: 'synthesis-community-wisdom',
    layer: 'synthesis',
    title: 'Community Intelligence Synthesis',
    prompt: `I'm going to provide you with career discussions scraped from Reddit and HackerNews — real people sharing real experiences about their careers.

Your job is to extract the WISDOM from the noise:

1. **Recurring themes**: What career advice comes up again and again from people with actual experience?
2. **Contrarian insights**: What do experienced professionals say that contradicts standard career advice?
3. **Industry-specific red flags**: What do insiders warn about that outsiders don't see?
4. **The salary reality**: What do real people report earning vs. what official data shows?
5. **Career satisfaction patterns**: What actually makes people happy or miserable in their careers, according to those living it?
6. **The advice gap**: What do people WISH someone had told them earlier?
7. **Success patterns**: Common threads in stories of successful career transitions or growth
8. **Failure patterns**: Common threads in career regrets and mistakes

Synthesize this into actionable intelligence. Remove the noise, extract the signal.

[SCRAPED COMMUNITY DATA WILL BE INJECTED HERE]

Format as structured markdown.`,
    requiresData: true,
    dataSource: 'reddit-career-posts.json'
  }
];

// ============================================================
// EXPORT ALL PROMPTS
// ============================================================
export const ALL_PROMPTS = [
  ...careerPathwayPrompts,
  ...decisionFrameworkPrompts,
  ...roiAnalysisPrompts,
  ...industryIntelPrompts,
  ...playbookPrompts,
  ...audiencePrompts,
  ...coreIdentityPrompts,
  ...synthesisPrompts
];

export const LAYERS = {
  'career-pathways': { name: 'Career Pathway Maps', prompts: careerPathwayPrompts },
  'decision-frameworks': { name: 'Decision Frameworks', prompts: decisionFrameworkPrompts },
  'roi-analysis': { name: 'ROI Analysis', prompts: roiAnalysisPrompts },
  'industry-intel': { name: 'Industry Intelligence', prompts: industryIntelPrompts },
  'playbooks': { name: 'Real-World Playbooks', prompts: playbookPrompts },
  'audience-guidance': { name: 'Audience-Specific Guidance', prompts: audiencePrompts },
  'core-identity': { name: 'Wayfinder Core Identity', prompts: coreIdentityPrompts },
  'synthesis': { name: 'Cross-Referenced Synthesis', prompts: synthesisPrompts }
};

export const PROMPT_COUNT = ALL_PROMPTS.length;
export const LAYER_COUNT = Object.keys(LAYERS).length;
