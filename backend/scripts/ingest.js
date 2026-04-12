/**
 * Knowledge Base Ingestion Pipeline
 *
 * Copies scraped data into the knowledge base directory in a format
 * optimized for the retrieval engine.
 *
 * Run after scraping: npm run ingest
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '..', '.env') });

const SCRAPED_DIR = join(__dirname, '..', 'data', 'scraped');
const KB_DIR = join(__dirname, '..', 'knowledge-base');

async function ingest() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  Wayfinder Knowledge Base Ingestion      ║');
  console.log('╚══════════════════════════════════════════╝\n');

  await fs.mkdir(KB_DIR, { recursive: true });

  // Check for scraped data
  let scrapedFiles;
  try {
    scrapedFiles = await fs.readdir(SCRAPED_DIR);
    scrapedFiles = scrapedFiles.filter(f => f.endsWith('.json') || f.endsWith('.md'));
  } catch {
    scrapedFiles = [];
  }

  // Always generate starter KB if knowledge base is empty
  const existingKB = await fs.readdir(KB_DIR).catch(() => []);
  if (existingKB.filter(f => f.endsWith('.md')).length === 0) {
    console.log('Generating starter knowledge base from static data...\n');
    await generateStarterKB();
  }

  if (scrapedFiles.length === 0) {
    console.log('No scraped data found. Run "npm run scrape" to add live data.');
    return;
  }

  // Copy markdown files from scraped data to knowledge base
  const mdFiles = scrapedFiles.filter(f => f.endsWith('.md'));
  let copied = 0;

  for (const file of scrapedFiles) {
    if (file.endsWith('.json')) {
      try {
        const raw = await fs.readFile(join(SCRAPED_DIR, file), 'utf-8');
        const data = JSON.parse(raw);

        // If it has a .content field with markdown, save as .md
        if (data.content && typeof data.content === 'string') {
          const mdName = file.replace('.json', '.md');
          await fs.writeFile(join(KB_DIR, mdName), data.content);
          console.log(`  Ingested: ${mdName}`);
          copied++;
        } else {
          // Copy JSON as-is for the retrieval engine
          await fs.copyFile(join(SCRAPED_DIR, file), join(KB_DIR, file));
          console.log(`  Ingested: ${file}`);
          copied++;
        }
      } catch (err) {
        console.warn(`  Skipped ${file}: ${err.message}`);
      }
    }
  }

  console.log(`\nIngested ${copied} files into knowledge base.`);
  console.log(`Knowledge base location: ${KB_DIR}`);
}

async function generateStarterKB() {
  // Generate a starter knowledge base even without scraping
  // This ensures the chatbot works out of the box

  const starterDocs = [
    {
      filename: 'career-exploration-basics.md',
      content: `# Career Exploration Guide for Students

## The RIASEC Interest Model

The Holland RIASEC model is the foundation of career exploration. It categorizes career interests into six types:

### Realistic (R)
Practical, hands-on problem solving. Working with tools, machines, plants, or animals.
Best for students who: enjoy lab work, building things, being outdoors
Sample careers: Engineering, agriculture, construction, environmental science

### Investigative (I)
Analytical thinking, research, and intellectual problem solving.
Best for students who: love asking "why?", enjoy research, want to understand how things work
Sample careers: Data science, research, medicine, economics

### Artistic (A)
Creative expression, innovation, and working in unstructured environments.
Best for students who: gravitate toward creative projects, dislike rigid rules
Sample careers: UX design, marketing creative, journalism, architecture

### Social (S)
Helping, teaching, counseling, and working with people.
Best for students who: volunteer, enjoy group work, feel energized by helping others
Sample careers: Counseling, teaching, HR, social work, public health

### Enterprising (E)
Leading, persuading, managing, and taking business risks.
Best for students who: lead clubs, enjoy debates, think about starting businesses
Sample careers: Management consulting, sales, entrepreneurship, law

### Conventional (C)
Organizing, managing data, and following established procedures.
Best for students who: like spreadsheets, planning, organizing events
Sample careers: Accounting, financial analysis, project management

## How to Use This Model
Most people have 2-3 dominant types. The combination matters more than any single type. For example:
- IC (Investigative-Conventional) → Data Science, Actuarial Science
- SE (Social-Enterprising) → Human Resources, Nonprofit Management
- AI (Artistic-Investigative) → UX Research, Architecture

## First Steps for Undecided Students
1. Take the O*NET Interest Profiler (free at onetonline.org)
2. Identify your top 2-3 RIASEC types
3. Explore 3 career clusters that match
4. Talk to one professional in each cluster (informational interview)
5. Try one related activity or course
`
    },
    {
      filename: 'salary-data-overview.md',
      content: `# Salary Data by Major (Bachelor's Degree)

## Highest Earning Majors (Median 4 Years After Graduation)
1. Computer Science: $105,000 (range: $55,000-$130,000)
2. Engineering: $100,000 (range: $58,000-$125,000)
3. Finance: $90,000 (range: $45,000-$115,000)
4. Mathematics: $88,000 (range: $45,000-$115,000)
5. Information Technology: $85,000 (range: $48,000-$110,000)
6. Economics: $85,000 (range: $40,000-$110,000)

## Mid-Range Earning Majors
7. Nursing: $75,000 (range: $52,000-$90,000)
8. Accounting: $72,000 (range: $42,000-$85,000)
9. Business Administration: $70,000 (range: $35,000-$95,000)
10. Health Professions: $68,000 (range: $38,000-$85,000)
11. Marketing: $68,000 (range: $35,000-$90,000)

## Lower Starting But Growth Potential
12. Political Science: $65,000 (range: $32,000-$85,000)
13. Social Sciences: $58,000 (range: $30,000-$75,000)
14. Communications: $55,000 (range: $30,000-$72,000)
15. Biological Sciences: $55,000 (range: $28,000-$75,000)

## Important Context
- These are MEDIAN figures — the range matters more than the middle number
- Earnings vary enormously by: institution, location, specific role, and individual effort
- Graduate school significantly changes the picture for psychology, biology, and social sciences
- Lower-earning majors paired with data analysis, coding, or business skills can match higher-earning majors
- The 25th-75th percentile range shows what's realistically achievable

Source: NCES College Scorecard, BLS OOH
`
    },
    {
      filename: 'top-certifications-students.md',
      content: `# Top Professional Certifications for College Students

## Technology
### AWS Cloud Practitioner
- Cost: $100 | Time: 1-2 months
- No prerequisites, huge demand
- Cloud skills add 25-30% salary premium
- AWS offers free student training and credits

### CompTIA Security+
- Cost: ~$400 | Time: 2-4 months
- Cybersecurity has massive talent shortage
- Required for government/defense security work
- Starting salary: $65,000-$85,000

### Google Data Analytics Certificate
- Cost: ~$200-300 (Coursera) | Time: 3-6 months
- Teaches SQL, R, Tableau — pairs with ANY major
- Best bang-for-buck credential for non-tech majors
- Data analysts earn median $82,000

## Finance & Business
### CFA Level I
- Cost: ~$1,200 for Level I | Start studying junior year
- Essential for investment banking, asset management, equity research
- Charterholders earn median $180,000+
- Can register as final-year student

### CPA
- Cost: ~$2,000-4,000 | Requires 150 credit hours
- 10-15% salary premium over non-CPA accountants
- Big 4 firms prefer CPA-eligible candidates
- Plan the 150-hour requirement early (often requires 5th year)

### CAPM (Project Management)
- Cost: ~$400 | Time: 2-3 months
- Great addition to ANY major
- Project management needed in every industry
- Stepping stone to PMP ($116K median)

## Human Resources
### SHRM-CP
- Cost: ~$500 | Time: 3-6 months (student discount available)
- HR is growing and well-compensated
- HR specialists start $60,000-$75,000
- People-focused alternative to pure business roles
`
    },
    {
      filename: 'government-careers-students.md',
      content: `# Government Career Pathways for Students

## Student Programs

### Pathways Internship Program
- Eligibility: Currently enrolled students (high school through grad school)
- Paid work in federal agencies during enrollment
- May lead to permanent position
- Pay: GS-2 to GS-7 depending on education
- How to apply: Search "Pathways Intern" on usajobs.gov

### Recent Graduates Program
- Eligibility: Graduated within 2 years (6 for veterans)
- Full-time positions with training and mentoring
- 1 year with conversion to permanent possible
- Pay: GS-5 to GS-9
- How to apply: Search "Pathways Recent Graduates" on usajobs.gov

### Presidential Management Fellows (PMF)
- Most prestigious federal entry program
- Must have graduate degree within past 2 years
- 2-year fellowship with rotational assignments
- Converts to GS-12/13 (senior entry level)
- Apply at pmf.gov during annual open season (fall)

## Federal Pay & Benefits
- Entry-level (bachelor's): GS-5 ($33,693) or GS-7 ($41,637)
- With master's: GS-9 ($50,748)
- Within 3-5 years: GS-11/12 ($61,592-$73,789)
- Senior: GS-13-15 ($87,758-$128,078)
- Pay varies by locality (DC, NYC, SF get 25-35% more)

### Benefits Package
- Health insurance: government pays 70-75%
- Pension (FERS) + TSP 401k with 5% match
- 13-26 annual leave days/year
- 13 sick days, 11 paid holidays
- Student loan repayment: up to $10,000/year
- Job security and stability

### Public Service Loan Forgiveness (PSLF)
After 120 qualifying payments (10 years) working for government, remaining federal student loan balance is forgiven. Major benefit for graduates with high loan balances.

## International Students
- Most federal jobs require U.S. citizenship
- OPT: 12 months work authorization after graduation (36 for STEM)
- H-1B: Employer-sponsored, 65,000 annual cap + 20,000 for U.S. master's
- Top visa sponsors: tech companies, consulting firms, finance, healthcare, universities
`
    }
  ];

  for (const doc of starterDocs) {
    await fs.writeFile(join(KB_DIR, doc.filename), doc.content);
    console.log(`  Created: ${doc.filename}`);
  }

  console.log(`\nStarter knowledge base created with ${starterDocs.length} documents.`);
  console.log(`Location: ${KB_DIR}`);
  console.log(`\nTip: Run "npm run scrape" to add live data from BLS, O*NET, and more.`);
}

ingest().catch(console.error);
