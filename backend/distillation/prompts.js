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
// LAYER 9: COLLEGE ADMISSIONS INTELLIGENCE
// (Admissions is a co-equal pillar alongside career advising)
// ============================================================
const admissionsPrompts = [
  {
    id: 'admissions-strategic-playbook',
    layer: 'admissions',
    title: 'College Admissions Strategic Playbook',
    prompt: `You are building the strategic intelligence core for Wayfinder's college admissions advisory system. This is NOT a generic admissions guide — this is the $10,000 private consultant playbook made accessible.

Create comprehensive strategic intelligence covering:

1. **THE ADMISSIONS GAME — HOW IT ACTUALLY WORKS**
   - How admissions committees actually read applications (the 8-12 minute reality)
   - Institutional priorities most families don't understand: yield management, class shaping, development cases, legacy
   - The difference between "holistic review" marketing and actual selection mechanics
   - How demonstrated interest is tracked and weighted (varies enormously by school)

2. **EARLY DECISION / EARLY ACTION STRATEGY**
   - The mathematical advantage: ED acceptance rates vs RD at the top 30 schools (with actual numbers)
   - When ED is a smart play vs when it's a trap (financial aid implications)
   - REA vs ED vs EA vs Rolling — how to build a strategic timeline
   - The ED II second chance that most families don't know about
   - How to choose your ED school: it's game theory, not just preference

3. **SCHOOL-WITHIN-SCHOOL ARBITRAGE**
   - The biggest legal advantage in college admissions: applying to less competitive divisions
   - Specific examples: Cornell Hotel vs A&S, Columbia GS vs CC, Georgetown Nursing vs SFS, CMU Dietrich vs SCS
   - Internal transfer strategies after enrollment
   - When this strategy works and when it backfires

4. **APPLICATION ARCHITECTURE**
   - How to build a school list: the 2-3-2 reach/target/likely framework
   - Common mistakes in list building (too top-heavy, no genuine safeties, geographic clustering)
   - When to apply to 8 schools vs 15 vs 20+
   - How to sequence supplemental essays for maximum efficiency

5. **THE ESSAY HIERARCHY**
   - What actually matters: grades in rigorous courses > test scores > essays > extracurriculars (with nuance by school type)
   - The Common App essay: themes that work, themes that are overdone, structural approaches
   - "Why X School" supplements: the specific-to-generic ratio and what admissions officers actually want
   - The activity list: how to frame experiences for maximum impact

6. **FINANCIAL AID AS STRATEGY**
   - Need-blind vs need-aware: what this actually means for your chances
   - Net Price Calculators: the tool families don't use enough
   - The middle-income squeeze and how to navigate it
   - Leveraging competing offers: when and how to negotiate
   - Specific generous programs: QuestBridge, Posse, Gates, institutional programs
   - The "elite schools are cheaper" paradox for families under $75-100K

7. **TRANSFER PATHWAYS**
   - The community college → elite university pipeline (specific programs that work)
   - Which schools are genuinely transfer-friendly vs which only claim to be
   - How to build a transfer application that works
   - Gap year → reapplication strategy

8. **FORWARD-LOOKING ADMISSIONS TRENDS (2025-2030)**
   - Test-optional permanence: where it's staying, where it's reverting
   - AI's impact on essays and how admissions committees are adapting
   - Demographic cliff impact (2025-2030): which schools will get easier, which won't
   - Rising international competition and how it affects domestic applicants
   - The growing importance of demonstrated interest in a post-COVID world

Be specific with numbers, school names, and strategies. This should be the kind of intelligence that families currently pay $5K-$10K to access.

Format as structured markdown with clear headers.`
  },
  {
    id: 'admissions-school-selection-intelligence',
    layer: 'admissions',
    title: 'School Selection Intelligence & Tier Analysis',
    prompt: `Create a strategic school selection intelligence brief that helps families make informed decisions about WHERE to apply. This is the strategic layer that sits above raw admissions data.

Cover:

1. **SCHOOL TIER REALITY CHECK**
   - The actual hierarchy (not just US News rankings) based on: outcomes, aid generosity, alumni network strength, career placement
   - Why some "lower ranked" schools produce better outcomes for certain students
   - The LAC advantage: why Williams/Amherst/Pomona can outperform Ivies for certain career paths
   - Public university honors programs as an elite alternative (Barrett at ASU, Schreyer at Penn State, etc.)

2. **MAJOR-SCHOOL FIT ANALYSIS**
   - Schools where the major matters enormously for admissions (Cornell, Penn, CMU, Georgetown) vs where it doesn't (Harvard, Yale, Princeton)
   - How to use major declaration strategically without being dishonest
   - Pre-professional programs worth applying to directly: Wharton, Ross BBA, Stern, McIntire
   - When to apply undeclared vs declared

3. **GEOGRAPHIC STRATEGY**
   - In-state advantages: auto-admit policies, tuition arbitrage, flagship university value
   - Schools that heavily favor in-state (UNC, UVA, UT Austin, Cal/UCLA) vs those that don't
   - Urban vs rural campus: what this actually means for career outcomes and internship access
   - The "college town" experience vs the "city campus" experience

4. **SCHOOL CULTURE FIT**
   - Academic intensity spectrum: Caltech/Swarthmore/Chicago (intense) vs Brown/Stanford (flexible)
   - Greek life dominance: where it matters, where it doesn't
   - Research university vs teaching-focused: what this means for undergrads
   - School spirit/athletics culture: Notre Dame, Michigan, Duke vs MIT, Chicago, Caltech
   - Political and social climate: how to gauge this honestly

5. **THE ROI CONVERSATION**
   - Schools with the best financial aid (top 20 by generosity)
   - Merit scholarship strategy: where your stats will get you money
   - The "full price at a good school vs full ride at a lesser-known school" framework
   - When state school is genuinely the best choice (not just the safe choice)
   - Outcomes data by school: median earnings 10 years out, employment rates, grad school placement

6. **EMERGING SCHOOLS TO WATCH (2025-2030)**
   - Schools investing heavily in AI/tech programs
   - Schools with improving financial aid packages
   - Schools whose selectivity is increasing fastest
   - Schools that are undervalued relative to their outcomes data

Be data-driven and specific. Name schools, cite numbers, give actionable frameworks.

Format as structured markdown.`
  },
  {
    id: 'admissions-parent-strategy-guide',
    layer: 'admissions',
    title: 'Parent Strategic Intelligence Briefing',
    prompt: `Create the definitive strategic intelligence briefing for PARENTS navigating college admissions. Parents are Wayfinder's most valuable audience for admissions — they're the decision-makers, the financial planners, and often the emotional anchors.

Cover:

1. **THE PARENT'S TIMELINE (by child's grade)**
   - 9th grade: what to start thinking about (not stressing about)
   - 10th grade: course selection strategy, early exploration
   - 11th grade (critical year): testing strategy, school visits, summer programs, the "extracurricular spike"
   - 12th grade fall: application execution, ED decisions, managing stress
   - 12th grade spring: decision time, financial aid comparison, waitlist strategy
   - For each: specific actions, common mistakes, what matters and what doesn't

2. **HOW TO HELP WITHOUT HOVERING**
   - The research parents should do (financial aid, school research, deadline tracking)
   - The decisions that must be the student's (essay topics, school rankings, major choice)
   - How helicopter parenting actually HURTS admissions outcomes
   - When to push, when to back off, when to intervene

3. **THE MONEY CONVERSATION**
   - How to talk about budget honestly with your child
   - The FAFSA/CSS Profile demystified
   - How to compare financial aid packages apples-to-apples
   - When borrowing makes sense vs when it doesn't
   - The parent PLUS loan trap
   - How much is too much to pay for college? (The $250K question)

4. **MANAGING EXPECTATIONS**
   - How to have the "reach school rejection" conversation before it happens
   - Why the "best" school is rarely the most prestigious one
   - The correlation between school prestige and career success is weaker than parents think
   - How to celebrate likely/target school acceptances genuinely

5. **THE STRATEGIC PARENT PLAYBOOK**
   - How to build a balanced school list with your child
   - The ED conversation: when to encourage it and when to advise against it
   - How to evaluate demonstrated interest opportunities (campus visits, info sessions, alumni interviews)
   - How to help with essays without writing them
   - When to hire outside help (tutoring, essay review) and when it's a waste of money

6. **RED FLAGS AND SCAMS**
   - College admissions consultant red flags ($30K+ packages, guaranteed admission claims)
   - "College prep" programs that don't actually help
   - Test prep: what's worth the money and what isn't
   - How to identify genuine opportunities vs resume padding

7. **THE FORWARD-LOOKING LENS FOR PARENTS**
   - Your child's career trajectory matters more than the school name — how to think about this
   - The demographic cliff: how declining college-age population (2025-2030) changes the game
   - AI and the future of education: what skills will matter when your child graduates in 2028-2032
   - The gap year value: when it's strategic, not just delayed

Write with warmth and strategic depth. Parents are investing their child's future AND their family's financial security. Treat this with the gravity it deserves.

Format as structured markdown.`
  },
  {
    id: 'admissions-essay-intelligence',
    layer: 'admissions',
    title: 'College Essay Strategic Intelligence',
    prompt: `Create the definitive essay strategy guide for college applicants. This should be the kind of insight that top admissions consultants provide — not generic "be yourself" advice.

Cover:

1. **HOW ADMISSIONS OFFICERS ACTUALLY READ ESSAYS**
   - The 3-5 minute reality: how to make an impact in limited reading time
   - What AOs are actually evaluating (intellectual curiosity, self-awareness, writing ability, maturity)
   - The difference between "interesting" and "impressive" — AOs want the former
   - How essays are scored/rated at different institutions

2. **THE COMMON APP PERSONAL STATEMENT**
   - The 7 prompts: what each one is actually asking for (decoded)
   - Themes that consistently work: intellectual obsession, meaningful failure, cultural bridge, quiet transformation
   - Themes that are OVERDONE: sports injury comeback, mission trip epiphany, immigration narrative (unless truly unique), pandemic reflection
   - Structural approaches: narrative arc, in medias res, thematic montage, reflective analysis
   - The opening line: why it matters and 10 approaches that work

3. **SUPPLEMENTAL ESSAY STRATEGY**
   - "Why X School" — the formula: 40% specific academics, 30% community/culture, 30% personal connection
   - How to research a school well enough to write a genuine supplement (beyond the website)
   - The "activity elaboration" essay: how to go deep without just describing
   - Short answer essays (100-250 words): how to be substantive in limited space
   - School-specific quirky essays (UChicago, MIT, Stanford): how to stand out

4. **THE ESSAY ECOSYSTEM**
   - How to choose which essays to write first for maximum reuse
   - The "core narrative" approach: build 3-4 themes that adapt across applications
   - Time management: a realistic essay-writing timeline
   - Revision strategy: how many drafts, who should read them, when to stop editing

5. **WHAT DOESN'T WORK**
   - The thesaurus essay (overwritten, inauthentic vocabulary)
   - The resume essay (listing achievements instead of reflecting)
   - The "I learned the real meaning of..." essay (preachy, predictable)
   - The controversial opinion essay (almost always backfires)
   - AI-generated essays: how AOs detect them, why they fail, the risks

6. **VOICE AND AUTHENTICITY**
   - How to write in your own voice (not your parent's, not your tutor's)
   - The difference between vulnerability and trauma dumping
   - How to be genuine without being naive
   - Writing about privilege, wealth, or advantage without tone-deafness
   - Writing about hardship without being exploitative

7. **SCHOOL-SPECIFIC ESSAY INTELLIGENCE**
   - Ivy League essay philosophy differences (Harvard: intellectual vitality, Yale: community, Princeton: academic depth)
   - Common supplement patterns and how to decode what each school really wants
   - How to handle the "Why this major" essay when you're not sure about your major

Be specific, strategic, and practical. Include examples of approaches, not just principles.

Format as structured markdown.`
  },
  {
    id: 'admissions-curriculum-synthesis',
    layer: 'admissions',
    title: 'Curriculum & Academic Program Intelligence Synthesis',
    requiresData: true,
    dataSource: 'curriculum-data.json',
    prompt: `I'm going to provide you with detailed curriculum data from 49 top universities — core requirements, popular major sequences, academic features, and program structures.

Your job is to SYNTHESIZE this into strategic intelligence that helps students and parents make better decisions:

1. **CURRICULUM PHILOSOPHY SPECTRUM**
   - Map schools on a spectrum: rigid core (Columbia, Chicago, St. John's) → distribution requirements (most schools) → open curriculum (Brown, Amherst, Grinnell)
   - What each philosophy means for the student experience and career preparation
   - Which approach is best for which type of student

2. **MAJOR REQUIREMENT COMPARISON**
   - For the top 5 most popular majors (CS, Econ, Biology, Psychology, Engineering), compare requirements across schools
   - Which schools have the most/least flexibility within the major?
   - Where can you double major most easily? Where is it practically impossible?
   - Pre-med requirements: how they vary by school and what this means strategically

3. **HIDDEN ACADEMIC GEMS**
   - Unique programs most students don't know about (Stanford's d.school, MIT's UROP, Princeton's thesis requirement, Brown/RISD dual degree)
   - Cross-registration opportunities that effectively multiply course access
   - Research opportunities for undergrads: which schools genuinely provide access vs which just claim to
   - Study abroad programs that are genuinely transformative vs tourism with credit

4. **ACADEMIC INTENSITY MAPPING**
   - Grade inflation reality: where A's are easy (Harvard, Brown, Stanford) vs where they're earned (Caltech, MIT, Swarthmore)
   - Course load expectations: credit hours, typical class sizes, professor accessibility
   - How academic culture differs: collaborative (Brown, Rice) vs competitive (Hopkins pre-med, Chicago econ)

5. **PROGRAM STRENGTH VS SCHOOL PRESTIGE**
   - Schools where specific departments dramatically outperform the overall ranking (UIUC CS, UW-Madison biology, Georgia Tech engineering)
   - When attending a "lower-ranked" school for a top program beats a "higher-ranked" school with a weaker department
   - Emerging programs worth watching at schools investing heavily in new fields

6. **THE FORWARD-LOOKING CURRICULUM LENS**
   - Which schools are adding AI/ML courses fastest?
   - Interdisciplinary programs that position students for 2028+ careers
   - Schools where the curriculum is evolving vs schools stuck in traditional models
   - How the rise of AI changes what curriculum features matter most

[SCRAPED CURRICULUM DATA WILL BE INJECTED HERE]

Format as structured markdown with clear actionable insights.`
  },
  {
    id: 'admissions-data-synthesis',
    layer: 'admissions',
    title: 'Admissions Data Deep Interpretation',
    requiresData: true,
    dataSource: 'college-admissions.json',
    prompt: `I'm going to provide you with detailed admissions data including acceptance rates, ED/EA advantages, school-within-school differentials, financial aid details, and strategic intelligence for 49 top universities.

Your job is to INTERPRET this data into strategic admissions intelligence:

1. **THE BIGGEST ED ADVANTAGES** — Rank the schools where ED provides the largest acceptance rate boost. Which schools are practically impossible to get into Regular Decision but feasible through ED?

2. **SCHOOL-WITHIN-SCHOOL ARBITRAGE MAP** — For every school with multiple colleges/schools, map the acceptance rate differentials. Identify the top 10 most impactful strategic entry points (e.g., Cornell Hotel, Columbia GS, CMU Dietrich).

3. **TRANSFER PATHWAY INTELLIGENCE** — Which schools are genuinely transfer-friendly? Rank by transfer acceptance rate and identify the best feeder pathways (community college programs, 2+2 arrangements, guaranteed transfer agreements).

4. **FINANCIAL AID GENEROSITY RANKING** — Which schools are the most generous? The "no loans" schools, the income thresholds for free tuition, the best merit scholarship opportunities. Create an actionable comparison.

5. **THE DEMOGRAPHIC CLIFF ANALYSIS** — Based on current selectivity trends, which schools will likely become more accessible 2025-2030 as the college-age population declines? Which schools are immune due to international demand?

6. **CONTRARIAN ADMISSIONS INSIGHTS** — What does the data reveal that contradicts conventional admissions wisdom? Where are the genuine opportunities that most families miss?

7. **THE COMMUNITY INTELLIGENCE LAYER** — What strategic insights from Reddit, College Confidential, and admissions forums add to the official data? Admissions quirks, hidden pathways, strategic tips that insiders know.

Think like a strategic admissions consultant who charges $10K per family. What would you tell them that they can't find on any school's website?

[SCRAPED ADMISSIONS DATA WILL BE INJECTED HERE]

Format as structured markdown.`
  },
  {
    id: 'admissions-pre-highschool-planning',
    layer: 'admissions',
    title: 'Pre-High School Strategic Planning for Parents (Grades 5-9)',
    prompt: `Create the definitive pre-high school strategic planning guide for parents. This is the content NO ONE provides — not admissions consultants (who only engage from 10th/11th grade), not school counselors (who are stretched too thin), and not college prep websites (which focus on juniors/seniors).

This is Wayfinder's contrarian, forward-thinking take on the EARLY years. Challenge conventional wisdom at every turn. Use data where it exists but don't be afraid to make strong, non-consensus arguments.

Cover:

1. **THE CONVENTIONAL WISDOM IS WRONG**
   - "Start worrying about college in junior year" — why this is already too late for many families
   - "Just let kids be kids" vs "strategic exposure" — where the real balance point is (it's not where most people think)
   - The myth of the "naturally gifted" applicant — elite college admits are almost always the product of YEARS of intentional development, not sudden senior-year magic
   - Why the "well-rounded" advice that school counselors give is outdated and counterproductive

2. **GRADES 5-8: THE INVISIBLE FOUNDATION YEARS**
   - Math acceleration: why the math track your child is on in 6th grade determines their options in high school (and therefore college). The pipeline: if they're not in pre-algebra by 7th grade, calculus in 12th becomes nearly impossible at many schools.
   - Reading depth over breadth: why reading challenging books matters more than reading logs
   - The extracurricular exploration window: grades 5-8 is when kids should TRY everything. By 9th grade, they need to be narrowing.
   - Learning differences and early identification: ADHD, dyslexia, processing speed — catch them NOW, not in 10th grade when it's crisis mode
   - The technology question: coding exposure, digital literacy, but also screen time reality. What actually matters vs what's marketing.
   - Foreign language head start: why starting a language before high school creates a massive advantage

3. **9TH GRADE: THE MOST IMPORTANT YEAR NO ONE TALKS ABOUT**
   - 9th grade GPA counts. Many parents don't realize this until 11th grade. The GPA is cumulative from day one of high school.
   - Course selection strategy: honors vs regular, which APs to plan toward, the 4-year course map
   - The extracurricular "spike" begins here: depth over breadth. One or two things at a high level beats ten things at a surface level.
   - Summer programs: which ones actually matter (RSI, MITES, Clark Scholars, Governor's Schools) vs which are resume padding
   - The social media audit starts NOW: clean digital footprint

4. **WHAT ACTUALLY PREDICTS ELITE ADMISSIONS (THE DATA)**
   - Analyze what longitudinal data shows about early predictors of selective college admission
   - Course rigor is the #1 predictor — not grades alone, not test scores, not extracurriculars
   - The impact of school quality and course offerings (if your school doesn't offer 10+ APs, how to supplement)
   - Socioeconomic factors: acknowledge them honestly, then provide strategies to mitigate
   - First-generation families: what they don't know that affluent families take for granted

5. **NON-CONSENSUS STRATEGIES**
   - The "anti-resume" approach: why developing genuine intellectual passion beats strategic activity stacking
   - Intellectual curiosity as a trainable skill, not an innate trait. How parents can cultivate it without killing it.
   - The case for public school over expensive private school (when the ROI actually favors public)
   - When to consider switching schools — and when switching is running from a solvable problem
   - The gap year planted early: normalizing non-linear paths from middle school
   - Mental health as an admissions strategy: a burned-out kid writes terrible essays. Sustainability matters.
   - Why the "tiger parent" approach statistically produces worse college outcomes than strategic, supportive parenting

6. **FORWARD-LOOKING: WHAT WILL MATTER IN 2028-2034**
   - AI literacy will be as important as computer literacy was in 2010
   - Interdisciplinary thinking will be rewarded more than single-track specialization
   - The skills that will matter when today's 5th grader applies to college: adaptability, cross-cultural competence, ethical reasoning, systems thinking
   - How the demographic cliff changes the calculus for today's elementary and middle schoolers

7. **THE PARENT PLAYBOOK BY YEAR**
   - Grade 5-6: specific actions, mindset shifts, what to start tracking
   - Grade 7-8: specific actions, conversations to have, skills to develop
   - Grade 9: the tactical playbook for the year that sets everything up
   - Common mistakes at each stage and how to avoid them

Be bold, specific, and non-consensus. This should feel like advice from a brilliant friend who happens to be an elite admissions strategist — not a cautious counselor reading from a playbook. Use data to challenge popular beliefs.

Format as structured markdown.`
  },
  {
    id: 'admissions-parent-adult-children',
    layer: 'admissions',
    title: 'Parent Playbook: Supporting Adult Children (Ages 20-30) — Career, Financial, & Strategic Guidance',
    prompt: `Create a comprehensive strategic playbook for PARENTS of adult children in their 20s. This is a massively underserved audience — parents don't stop caring or investing when their kid turns 18, but the advice ecosystem completely abandons them.

This should cover career support, financial strategy, tax optimization, and the evolving parent-child dynamic through the 20s decade. Be specific with numbers, strategies, and non-obvious insights.

Cover:

1. **THE NEW REALITY: PARENTING DOESN'T END AT 18**
   - The economics: 52% of 18-29 year olds lived with parents in 2023. The "failure to launch" framing is wrong — this is a rational economic response.
   - The financial entanglement: health insurance until 26, cosigned loans, shared phone plans, car insurance — the practical reality
   - The emotional dynamic: how to support without enabling, advise without controlling
   - When adult children are struggling (job loss, career confusion, mental health) — the parent's role

2. **CAREER SUPPORT STRATEGIES FOR PARENTS OF 20-SOMETHINGS**
   - How to help without hovering: the information/access/connection model
   - Leveraging your professional network for your child's career (and when NOT to)
   - The "safety net" effect: data shows that kids who know they have parental backup take better career risks (startups, career pivots, grad school)
   - When to push ("you need to get a job") vs when to support ("take time to figure this out")
   - Helping a child navigate a career crisis (layoff, wrong career choice, burnout)
   - The graduate school question from the parent's perspective: when to fund it, when to decline

3. **TAX & FINANCIAL STRATEGIES MOST FAMILIES MISS**
   - **529 Plan flexibility**: unused 529 funds can now roll over to Roth IRA (SECURE 2.0 Act). Up to $35K lifetime. The account must have been open 15+ years. This is a game-changer for families who over-saved.
   - **Gift tax strategy**: $18K/year per parent per child (2024). Married parents can give $36K/year tax-free. Fund a child's Roth IRA, first home down payment, or emergency fund.
   - **Roth IRA for young adults**: If your child has earned income, fund their Roth IRA NOW. $7,000/year. The compounding from age 22 to 65 is extraordinary. A parent can gift the money; the child just needs the earned income.
   - **Health insurance optimization**: Keep them on your plan until 26. After 26, help them evaluate ACA marketplace vs employer coverage vs health sharing ministries.
   - **Student loan strategy**: PSLF (Public Service Loan Forgiveness) — if your child works in public sector/nonprofit, this wipes loans after 10 years of income-driven payments. SAVE plan for income-driven repayment.
   - **First home assistance**: Gift money for a down payment (within gift tax limits). Consider whether buying a small property and having your child pay "rent" makes more financial sense than renting.
   - **Trust and estate basics**: At what net worth should parents set up a trust? When to add adult children to investment accounts. Beneficiary designations on 401k/IRA — review annually.
   - **Credit building for adult children**: Authorized user strategy (add child to your old credit card to build their credit history). Helping them understand credit utilization, age of accounts, etc.

4. **WEALTH TRANSFER & GENERATIONAL STRATEGY**
   - The intergenerational wealth conversation most families avoid having
   - When and how to disclose family financial situation to adult children
   - Annual gifting strategy to reduce estate tax exposure while helping kids NOW
   - Setting up a family investment club or shared brokerage account for financial education
   - Real estate as generational wealth: helping your child buy property early
   - Life insurance as a wealth transfer tool (when it makes sense, when it's a scam)
   - The "family bank" model: structured lending to children with clear terms

5. **STAGE-SPECIFIC PLAYBOOKS**
   - **Age 20-22 (college/early career)**: financial support guidelines, career exploration encouragement, the "first real job" transition
   - **Age 23-25 (establishing)**: pulling back financial support gradually, mentoring on budgeting/investing, navigating the child's first career crisis
   - **Age 26-30 (building)**: partnership dynamics (supporting but not controlling), helping with major life decisions (grad school, home purchase, career pivot, starting a business)

6. **NON-CONSENSUS INSIGHTS**
   - Why "cutting them off at 22" often HURTS long-term outcomes (the data on parental support and career risk-taking)
   - The myth of "self-made": virtually every successful person had some form of family/institutional support. Strategic parental investment is not "spoiling" — it's creating optionality.
   - When to say no: the line between investment and enabling. Specific criteria for evaluating requests.
   - The career pivot in your child's late 20s is NORMAL, not a failure. Most people change careers 3-5 times.
   - Mental health support costs money. A parent paying for therapy is one of the highest-ROI investments possible.

7. **FORWARD-LOOKING: THE 2025-2035 ECONOMIC LANDSCAPE FOR YOUNG ADULTS**
   - Housing affordability crisis: how parents can help navigate this
   - Student debt landscape: current forgiveness programs, future trajectory
   - The gig economy and non-traditional careers: when to be supportive vs concerned
   - AI disruption and career resilience: which of your child's skills are durable?
   - Remote work and geographic arbitrage: helping your child make location decisions

Be specific with dollar amounts, tax figures, and actionable strategies. This should feel like advice from a family wealth advisor who also deeply understands career strategy and the modern young adult experience. Use current tax law (2024-2025) and financial data.

IMPORTANT: Include appropriate caveats that tax and financial advice should be verified with a CPA/financial advisor, as rules change. But still be specific and actionable — don't hide behind disclaimers.

Format as structured markdown.`
  }
];

// ============================================================
// LAYER 10: ADMISSIONS ADVANCED STRATEGY
// ============================================================
// These prompts cover advanced strategic topics that differentiate
// Wayfinder from generic admissions advice: ED calibration,
// adversity/landscape intelligence, diversity profiling, and
// extracurricular differentiation.

const admissionsAdvancedPrompts = [
  {
    id: 'admissions-ed-strategy-calibration',
    layer: 'admissions-advanced',
    title: 'Early Decision Strategy Calibration — Beyond the Acceptance Rate Myth',
    prompt: `Create the definitive strategic intelligence on Early Decision that corrects the most common and damaging misconception in college admissions: that ED is a simple "acceptance rate boost."

This is where Wayfinder differentiates from every other admissions resource. Most consultants, websites, and even experienced counselors treat ED as straightforward arbitrage — "the acceptance rate is higher, so apply ED." This is dangerously misleading and costs families their most powerful strategic lever.

Cover:

1. **THE ED ACCEPTANCE RATE ILLUSION**
   - Why published ED acceptance rates (e.g., Northwestern ~23% ED vs ~5% RD) are misleading
   - The self-selection composition of ED pools: legacy candidates (many schools give legacy preference primarily in ED), recruited athletes (who are essentially pre-admitted), development cases (major donor families), and students with genuinely elite profiles who've done extensive research
   - Quantify where possible: at many Ivies, 30-40% of the ED admitted class are recruited athletes or legacies. The "regular applicant" ED rate is significantly lower than the headline number
   - The psychological trap: families see "23% vs 5%" and think ED quintuples their chances. The real boost for a non-hooked applicant is meaningful but far more modest

2. **THE CALIBRATION FRAMEWORK**
   - Define profile tiers relative to each school's applicant pool:
     * MAX PROFILE: Top 10% of that school's typical admits — GPA, scores, ECs all at or above 75th percentile. For these students, ED to the dream school is well-calibrated.
     * COMPETITIVE PROFILE: Solidly within the school's admit range (25th-75th percentile on key metrics). ED provides meaningful edge but it's a calculated bet.
     * STRETCH PROFILE: At or below the 25th percentile of typical admits. ED provides minimal actual advantage because you're competing against an even stronger self-selected pool. This is where deploying ED is most often wasted.
   - The calibration question every family should ask: "Is my child competitive WITHIN the ED pool at this school, or just competitive relative to the overall applicant pool?"
   - How to assess this: compare your profile not against the school's overall admitted student stats, but against the likely composition of their ED applicants

3. **STRATEGIC ED DEPLOYMENT SCENARIOS**
   - Scenario A: Top-tier profile → ED to the dream school works well. The ED signal of genuine commitment adds to an already strong application.
   - Scenario B: Strong-but-not-max profile → Consider deploying ED at a school where you're in the top half of their ED pool rather than the bottom half of a more selective school's pool. The strategic value of ED is highest when it turns a "likely" into a "definite" or a "target" into a "likely" — not when it turns a "far reach" into a "slightly less far reach."
   - Scenario C: The school-within-school ED combination → Apply ED to the less competitive division at a target school. This is an advanced move that combines two strategic advantages.
   - Scenario D: Financial considerations → ED is binding. If you need to compare financial aid packages, ED removes that leverage. For families where financial aid comparison is critical, REA (Restrictive Early Action) at schools that offer it may be strategically superior.

4. **ED II: THE SECOND CHANCE MOST FAMILIES IGNORE**
   - Many selective schools offer ED II (January deadline, February notification)
   - ED II pools are typically smaller and slightly less competitive than ED I
   - Strategic use: if your ED I doesn't work, having a pre-identified ED II target maintains strategic pressure
   - Schools with notable ED II programs and when this play makes sense

5. **THE EMOTIONAL AND FINANCIAL DIMENSIONS**
   - How to have the ED conversation with your child honestly
   - The binding nature: when to be comfortable with it, when it's a red flag
   - Financial aid under ED: schools claim to meet full need, but you can't compare offers. When this matters and when it doesn't.
   - The "right fit" question: ED should only be used when the school is genuinely the top choice. Using it purely as a strategic weapon backfires if the student ends up at a school they don't love.

6. **WHAT MOST CONSULTANTS GET WRONG**
   - The "spray and pray" approach to ED recommendations
   - Failing to account for the composition of the ED pool
   - Treating all ED advantages as equal across schools (they're not — the ED boost varies significantly by institution)
   - Not considering how the student's specific profile interacts with a school's particular ED pool composition
   - Ignoring ED II entirely

7. **WAYFINDER'S ED DECISION TREE**
   - Create a clear, actionable decision framework that families can use to determine:
     (a) Should they apply ED at all?
     (b) If yes, to which school?
     (c) What's their realistic probability with and without ED at each target?
     (d) Is the strategic value worth the binding commitment?

Be bold and data-driven. Use specific schools as examples. This should read like intelligence from someone who deeply understands how admissions offices actually operate, not someone reading acceptance rate tables.

Format as structured markdown.`
  },
  {
    id: 'admissions-adversity-landscape-intelligence',
    layer: 'admissions-advanced',
    title: 'Adversity & Landscape Intelligence — The Post-SFFA Admissions Reality',
    prompt: `Create comprehensive strategic intelligence on how the adversity/demographic context landscape in college admissions has fundamentally shifted after the Supreme Court's SFFA v. Harvard decision (2023) and the discontinuation of the College Board's Landscape tool (September 2025).

This is intelligence that virtually no private admissions consultant provides. In Wayfinder's research, the majority of consultants — even expensive ones — were not even aware of what the Landscape tool was, let alone how its removal is reshaping admissions practices. This represents a genuine information asymmetry that Wayfinder can help families navigate.

Cover:

1. **THE FULL HISTORY: ADVERSITY SCORE → LANDSCAPE → DISCONTINUATION**
   - 2019: College Board launches the Environmental Context Dashboard (quickly dubbed "Adversity Score"). Provided a single numerical score based on neighborhood and high school data (crime rates, median income, AP availability, college-going rates). Immediate backlash.
   - August 2019: Rebranded as "Landscape" — separate school and neighborhood context scores rather than a single number. Made methodology public. Rolled out to 100+ colleges.
   - How Landscape worked: admissions officers saw contextual data alongside a student's SAT scores — poverty rates, high school graduation rates, AP course availability, housing values for the student's area.
   - 2022: Brookings Institution study found Landscape increased admissions of "high-challenge" background students at schools that used it. Also found it was NOT an accurate proxy for race (contrary to critics' claims).
   - June 2023: SFFA v. Harvard ruling bans race-conscious admissions. Landscape becomes both more valuable to schools seeking socioeconomic diversity AND more politically radioactive.
   - August 2025: Trump administration executive order requires colleges to submit data proving they aren't using demographic/geographic information as racial proxies.
   - September 2025: College Board discontinues Landscape. Official statement cited "evolving federal and state policy." Edward Blum's Students for Fair Admissions had called it "a disguised proxy for race."

2. **THE STRATEGIC VACUUM: WHAT SCHOOLS LOST AND HOW THEY'RE ADAPTING**
   - Schools lost their standardized, third-party tool for understanding applicant adversity context
   - They did NOT lose their desire for that information — institutional commitment to socioeconomic diversity remains strong at most selective schools
   - How schools are adapting (observable patterns):
     * Essay prompt evolution: Increasing use of "tell us about your circumstances," "what challenges have you faced," "is there anything else you'd like us to know" prompts. These function as informal adversity capture mechanisms.
     * Supplemental information sections: More schools adding optional sections for context about background, circumstances, or hardship
     * High school profile analysis: Schools have always received school profiles (demographics, course offerings, testing data). Without Landscape, they're likely relying more heavily on their own analysis of this information.
     * Community-based organization partnerships: Expanded recruiting through CBOs (QuestBridge, Posse, Prep for Prep, etc.) that pre-identify high-adversity, high-potential students
     * Admissions officer training: Likely increased emphasis on contextual reading of applications
   - Specific examples of essay prompt changes that appear designed to capture adversity context (UW application as a particularly clear example, but the pattern is broadly visible)

3. **STRATEGIC GUIDANCE FOR FAMILIES WITH GENUINE ADVERSITY STORIES**
   - If you have a real adversity narrative (first-gen, low-income, challenging home circumstances, significant obstacles overcome), understand that schools are ACTIVELY seeking this information through their application design
   - These essay prompts and supplemental sections are invitations, not formalities
   - How to share adversity authentically without trauma-dumping:
     * Focus on how adversity shaped your perspective, resilience, or goals — not just that it happened
     * Be specific and genuine — admissions officers can distinguish between real and performed hardship
     * Connect adversity to what you'll bring to campus, not just what you've endured
   - The information asymmetry problem: well-resourced families with good consultants already know to leverage these prompts. First-gen and under-resourced families — the ones who ACTUALLY have adversity stories — often don't realize the prompts are strategic opportunities. This is a genuine equity gap Wayfinder can help close.

4. **STRATEGIC GUIDANCE FOR WELL-RESOURCED FAMILIES**
   - Do NOT attempt to manufacture adversity. Admissions officers read thousands of applications and can detect inauthentic hardship narratives.
   - If your child hasn't faced significant adversity, that's fine — use these prompts for genuine context about your family, not fabricated struggle
   - Well-resourced applicants should focus their essays on intellectual curiosity, genuine passion, depth of engagement, and what they'll contribute — not on trying to compete on an adversity axis that isn't authentic to them
   - The worst outcome: an essay that reads as tone-deaf privilege-signaling in an attempt to manufacture hardship. This actively harms the application.

5. **THE LEGAL AND POLITICAL LANDSCAPE**
   - The SFFA decision banned race-conscious admissions but explicitly allowed consideration of how race has affected an individual's life (in essays)
   - The distinction between systemic demographic tools (banned direction of travel) and individual narrative sharing (still permitted)
   - How the political environment may continue to evolve and what this means for admissions strategy
   - The tension between schools' institutional diversity commitments and the narrowing legal/political space for pursuing them

6. **SCHOOL-BY-SCHOOL ADVERSITY ORIENTATION**
   - Some schools are more actively seeking adversity context than others
   - Observable signals: essay prompt design, financial aid philosophy (need-blind with generous thresholds = strong commitment), institutional partnerships (QuestBridge, Posse), public statements post-SFFA, historical demographic data of admitted classes
   - Help families understand which schools are most actively building their own adversity-context mechanisms and how this should inform application strategy

7. **FORWARD-LOOKING: WHERE THIS IS HEADING**
   - Schools will continue to find ways to assess socioeconomic context — the demand hasn't disappeared, just the centralized tool
   - Likely evolution: more sophisticated essay analysis, expanded CBO partnerships, AI-assisted contextual reading of applications
   - The information asymmetry between well-advised and under-advised families will likely increase — making tools like Wayfinder more important

Write with strategic depth and specificity. This should feel like intelligence from someone who understands the structural dynamics of admissions — not surface-level advice about "being authentic in your essays."

Format as structured markdown.`
  },
  {
    id: 'admissions-diversity-school-profiling',
    layer: 'admissions-advanced',
    title: 'Institutional Diversity Orientation Profiling — School-by-School Intelligence',
    requiresData: true,
    dataSource: 'college-admissions.json',
    prompt: `Create a comprehensive diversity orientation profile for each school in the provided admissions dataset. This is a strategic intelligence product that helps families understand the institutional posture of each school toward diversity, socioeconomic context, and how this should inform application strategy.

This is NOT about ranking schools on a "wokeness" scale. It's about understanding observable, data-driven signals that indicate how each school values and pursues diversity in its admissions process, and what this means practically for different types of applicants.

For each school (or grouped by tier where patterns are consistent), analyze:

1. **FINANCIAL AID PHILOSOPHY (Strongest Signal)**
   - Need-blind vs need-aware admissions (and whether need-blind applies to international students)
   - Percent of students receiving Pell Grants (strong proxy for socioeconomic diversity commitment — national average is ~33%; elite schools range from ~12% to ~25%)
   - No-loan policies and income thresholds for free tuition
   - Average net price by income bracket (College Scorecard data)
   - Merit scholarship availability and strategy
   - Assessment: schools that invest heavily in financial aid are making a structural commitment to socioeconomic diversity, regardless of their public messaging

2. **INSTITUTIONAL PARTNERSHIPS (Observable Commitment)**
   - QuestBridge partner status (connects low-income high-achievers with schools)
   - Posse Foundation partnerships (identifies students from diverse backgrounds through dynamic assessment)
   - Other CBO (Community-Based Organization) partnerships
   - Fly-in programs for underrepresented students
   - Pre-orientation programs for first-gen students
   - Assessment: these partnerships represent meaningful resource allocation toward diversity

3. **ESSAY PROMPT ANALYSIS (Post-Landscape Signal)**
   - Does the school include prompts that explicitly invite adversity/context sharing?
   - Has the school added new supplemental questions in recent cycles that appear designed to capture background information?
   - Optional "additional information" sections and how they're framed
   - "Why us" prompts that emphasize community contribution and diverse perspectives
   - Assessment: schools actively adding adversity-capture prompts post-Landscape are signaling continued commitment

4. **ADMITTED CLASS DEMOGRAPHICS (Historical Trends)**
   - First-generation student percentage (trend over time)
   - Geographic diversity (heavy in-state vs national vs international mix)
   - Socioeconomic diversity indicators (Pell Grant %, income distribution)
   - How these numbers have changed post-SFFA decision (2023+)
   - Assessment: trends matter more than snapshots — a school whose diversity metrics are declining post-SFFA may have relied heavily on race-conscious practices

5. **INSTITUTIONAL RESPONSE TO SFFA (Public Posture)**
   - Did the school issue a public statement after the ruling? What did it say?
   - Has the school publicly committed to maintaining diverse classes through race-neutral means?
   - Any observable changes to admissions practices, outreach, or marketing
   - Assessment: schools that responded with detailed action plans are signaling stronger commitment than schools that issued generic statements

6. **SCHOOL CULTURE INDICATORS**
   - Cultural centers, identity-based organizations, and institutional support structures
   - Campus climate data if available (student surveys, diversity office resources)
   - Whether diversity is integrated into the academic mission or treated as supplementary
   - Assessment: structural investment (offices, staff, programs) vs symbolic investment (statements, web pages)

For each school, produce a brief DIVERSITY ORIENTATION SUMMARY with:
- Overall orientation: [Strong Structural Commitment / Moderate Commitment / Minimal Observable Commitment]
- Key signals supporting the assessment
- Strategic implications for applicants:
  * For students with adversity narratives: how to leverage this school's receptivity
  * For well-resourced students: how to present authentically within this school's values context
  * For first-gen/low-income students: specific programs and pathways to highlight

Group schools into tiers where patterns are clear, but call out individual schools with notably strong or weak signals.

IMPORTANT: Be data-driven and specific. Cite observable, verifiable indicators — not vibes or reputation. The goal is actionable strategic intelligence, not political commentary. A family should be able to read this and make better-informed decisions about how to present themselves to each school.

[SCRAPED ADMISSIONS DATA WILL BE INJECTED HERE]

Format as structured markdown.`
  },
  {
    id: 'admissions-extracurricular-differentiation-strategy',
    layer: 'admissions-advanced',
    title: 'Extracurricular Differentiation — Beyond the Commoditized Playbook',
    prompt: `Create the definitive guide to extracurricular strategy that accounts for the fundamental reality most admissions advisors ignore: the traditional EC playbook has been commoditized to the point of uselessness.

This is a critical piece of Wayfinder's differentiation. Every admissions consultant in America tells students to "start a club," "do community service," "build a passion project," and "show leadership." This advice was genuinely differentiating 10-20 years ago. By 2025, it's so universally followed that it has zero signal value. Admissions officers at selective schools have seen thousands of "President, Students for Environmental Awareness" and "Founder, Coding Non-Profit" entries. They know what most of them actually are.

Cover:

1. **THE COMMODITIZATION CYCLE**
   - How extracurricular advice follows a predictable decay pattern:
     * Phase 1: Genuinely differentiating strategy (few people do it)
     * Phase 2: Consultants and websites popularize it (adoption grows)
     * Phase 3: It becomes standard practice (everyone does it, loses signal value)
     * Phase 4: Admissions officers recalibrate (actively discount it)
   - Track specific strategies through this cycle:
     * "Start a club" — hit Phase 4 by ~2015
     * "Passion project" — currently in Phase 3-4, rapidly commoditizing
     * "Published research" — entering Phase 3 as companies now build research experiences for students as a service
     * "Social media following / content creation" — currently Phase 2, still has some signal value but declining
   - The industrialization problem: there are now companies that manufacture passion projects, research papers, and nonprofit experiences for students. Admissions officers are increasingly aware of this and discount accordingly.

2. **WHAT ADMISSIONS OFFICERS ACTUALLY LOOK FOR (AND HOW IT'S CHANGED)**
   - The shift from QUANTITY to QUALITY to AUTHENTICITY:
     * 2000s: "Well-rounded" — do lots of things
     * 2010s: "Angular" — go deep on one thing
     * 2020s+: "Authentic and verifiable" — genuine engagement with real impact you can't fake
   - What AOs can and can't verify: a club presidency can be a title on paper; a business with revenue is verifiable through tax records, a website, and real customers
   - The "sniff test" — experienced AOs develop strong instincts for distinguishing genuine engagement from consultant-manufactured activities. The clearest signal: does the output speak for itself, or does it require explanation to seem impressive?
   - What actually stands out in 2025+: work that produces observable, real-world impact — not activities that primarily exist to be listed on an application

3. **THE DIFFERENTIATION FRAMEWORK: PERFORMED AMBITION VS. DEMONSTRATED CAPABILITY**
   - PERFORMED AMBITION: Activities whose primary purpose is to signal the right qualities to admissions. The output is the application line item, not the real-world impact. Examples: club founded that exists for 6 months with 4 members, "passion project" website that gets 12 visitors, nonprofit that raises $200 and exists solely on a resume.
   - DEMONSTRATED CAPABILITY: Activities where the output is self-evidently impressive and the application line item is almost unnecessary — the work speaks for itself. Examples: a business that generates real revenue solving a real problem, open-source code contributions that are publicly visible, a creative body of work with genuine audience engagement, solving an actual problem in their community where the results are measurable.
   - The key distinction: demonstrated capability is HARD TO FAKE. The barrier to entry is high enough that it naturally filters out performative activities. That's exactly why it has strong signal value.

4. **CONCRETE PATHS TO GENUINE DIFFERENTIATION**

   **A. Build Something Real (Business/Product)**
   - Starting a real business: not a "student venture" that exists on paper, but a genuine business with real customers, real revenue, and real operations
   - What "real" looks like: legal formation (even a simple LLC), actual financial records, a product or service that people pay for, customer relationships, problem-solving in real time
   - Why this is so powerful: it demonstrates initiative, execution, resilience, problem-solving, and financial literacy simultaneously. It's also nearly impossible to fake — the output is verifiable.
   - Practical path: identify a real problem (not a manufactured one), build a minimum viable solution, get real customers, iterate based on feedback. This can start as small as a local service business.
   - Age-appropriate guidance: a 10th grader starting a tutoring service or local business is impressive. A 10th grader "founding a startup" with a pitch deck and no revenue is not.

   **B. Technical Contribution (Engineering/Code/Research)**
   - Genuine contribution to open-source projects where commits are public and verifiable
   - Building functional tools or applications that real people use
   - Participating in real research (not pay-to-play research programs) where the student does actual work
   - The key: the output is publicly visible and can be evaluated by anyone with domain knowledge

   **C. Creative Production at Scale**
   - A body of creative work (writing, art, music, film, design) with genuine audience engagement
   - Published work in real publications (not pay-to-publish journals)
   - Content creation with authentic following built over time (not purchased followers)
   - The "gallery test": could this work be exhibited/performed/published on its own merit, regardless of the creator's age?

   **D. Community Problem-Solving With Measurable Impact**
   - Not "raised awareness" — actually changed something observable in the community
   - Built something that continues to function after the initial effort
   - Impact that can be described in specific, quantifiable terms
   - Examples: built and deployed a tool that a local organization actually uses, created a program that measurably improved outcomes (with data), organized something with real attendance and real consequences

5. **AGE-APPROPRIATE GUIDANCE**

   **Grades 5-8: The Exploration Window**
   - This is NOT the time for strategic EC planning. It's the time for authentic interest discovery.
   - Expose kids to a WIDE range of activities, domains, and experiences
   - Pay attention to what they voluntarily spend time on — that's the signal
   - Don't push depth yet; let breadth reveal natural inclinations
   - Resist the temptation to pre-optimize. A 6th grader doesn't need a "spike."

   **Grade 9: Begin Narrowing**
   - By now, some genuine interests should be emerging
   - Start going deeper on 1-2 areas of genuine interest
   - The goal: by the end of 9th grade, they should have a direction (not a destination)
   - Summer after 9th: first real opportunity for depth (genuine programs, not resume padding)

   **Grade 10: The Building Year**
   - This is the sweet spot for developing something real with genuine depth
   - If the interest is entrepreneurial: this is when to start an actual business or project
   - If academic: seek genuine research opportunities (not pay-to-play)
   - If creative: build a portfolio or body of work with real engagement
   - The test: is the student doing this because they want to, or because it looks good?

   **Grade 11: Demonstrating and Deepening**
   - The real work should already be underway. Junior year is about deepening, not starting from scratch.
   - This is when impact becomes measurable and describable
   - Begin thinking about how to articulate what they've done (for applications) without losing authenticity

   **Grade 12: Execution Mode**
   - Too late to manufacture. Focus on articulating what's genuine.
   - The essay is where authentic engagement shines — AOs can feel the difference between writing about something you lived and something you performed.

6. **WHAT TO AVOID**
   - "Passion project" companies that build ECs for students as a service
   - Pay-to-publish academic journals and predatory conferences
   - "Leadership" positions in clubs that don't do anything meaningful
   - Resume-length lists of shallow involvement (the classic "20 activities, none with depth")
   - Any activity where the primary audience is the admissions committee rather than the real world
   - Manufacturing hardship or adversity narratives to justify service activities

7. **THE EQUITY DIMENSION**
   - Well-resourced families can buy EC experiences. First-gen and low-income students often can't.
   - But here's the counterintuitive insight: GENUINE activities born from real circumstances are often MORE impressive than manufactured ones. A student who works a real job to help their family is demonstrating more than a student whose parents funded a "social enterprise."
   - Admissions officers are trained to contextualize activities within a student's circumstances
   - For under-resourced students: your real-world experience IS your differentiation. Don't try to compete with manufactured ECs — lean into what's genuine about your life.

Write with conviction. Challenge the conventional wisdom directly. Name specific examples of commoditized strategies and explain why they no longer work. This should feel like insider knowledge from someone who understands how admissions has evolved — not a generic "tips and tricks" article.

Format as structured markdown.`
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
  ...synthesisPrompts,
  ...admissionsPrompts,
  ...admissionsAdvancedPrompts
];

export const LAYERS = {
  'career-pathways': { name: 'Career Pathway Maps', prompts: careerPathwayPrompts },
  'decision-frameworks': { name: 'Decision Frameworks', prompts: decisionFrameworkPrompts },
  'roi-analysis': { name: 'ROI Analysis', prompts: roiAnalysisPrompts },
  'industry-intel': { name: 'Industry Intelligence', prompts: industryIntelPrompts },
  'playbooks': { name: 'Real-World Playbooks', prompts: playbookPrompts },
  'audience-guidance': { name: 'Audience-Specific Guidance', prompts: audiencePrompts },
  'core-identity': { name: 'Wayfinder Core Identity', prompts: coreIdentityPrompts },
  'synthesis': { name: 'Cross-Referenced Synthesis', prompts: synthesisPrompts },
  'admissions': { name: 'College Admissions Intelligence', prompts: admissionsPrompts },
  'admissions-advanced': { name: 'Admissions Advanced Strategy', prompts: admissionsAdvancedPrompts }
};

export const PROMPT_COUNT = ALL_PROMPTS.length;
export const LAYER_COUNT = Object.keys(LAYERS).length;
