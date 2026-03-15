/**
 * Professional Certifications & Organizations Scraper
 *
 * Compiles certification roadmap data from major professional organizations:
 * - CFA Institute (finance)
 * - AICPA (accounting)
 * - PMI (project management)
 * - CompTIA (technology)
 * - NACE (career services/salary data)
 * - SHRM (human resources)
 * - AWS/Google/Microsoft (cloud certifications)
 *
 * Most of this is curated static data since these orgs don't have public APIs.
 */

import { saveScrapedData, fetchHTML, cleanText } from './utils.js';
import * as cheerio from 'cheerio';

function getCertificationData() {
  return {
    title: 'Professional Certifications Guide for College Students',
    source: 'Compiled from CFA Institute, AICPA, PMI, CompTIA, NACE, and others',
    lastUpdated: new Date().toISOString(),
    certifications: [
      // FINANCE
      {
        name: 'CFA (Chartered Financial Analyst)',
        organization: 'CFA Institute',
        field: 'Finance & Investment Management',
        levels: 'Three exam levels (Level I, II, III)',
        timeToComplete: '2.5-5 years typical',
        cost: '~$3,000-$5,000 total (registration + exam fees)',
        requirements: 'Bachelor\'s degree (or final year student can register for Level I), 4,000 hours of relevant work experience for charter',
        salaryImpact: 'CFA charterholders earn median $180,000+ (varies significantly by role and location)',
        studentTip: 'Start studying in junior/senior year. Pass Level I before or just after graduation to stand out in investment banking, asset management, and equity research roles.',
        careers: ['Investment Banking', 'Asset Management', 'Equity Research', 'Financial Planning', 'Risk Management'],
        url: 'https://www.cfainstitute.org'
      },
      {
        name: 'CPA (Certified Public Accountant)',
        organization: 'AICPA / State Boards',
        field: 'Accounting',
        levels: 'Four exam sections (AUD, BEC, FAR, REG)',
        timeToComplete: '6-18 months for all sections',
        cost: '~$2,000-$4,000 (exam fees + review course)',
        requirements: '150 credit hours of education (most states), bachelor\'s degree, work experience varies by state',
        salaryImpact: 'CPAs earn 10-15% more than non-CPA accountants. Starting salary: $55,000-$70,000 at Big 4.',
        studentTip: 'The 150 credit hour requirement often means a 5th year or master\'s. Plan this early. Big 4 firms often prefer candidates who are "CPA eligible" at graduation.',
        careers: ['Public Accounting (Big 4)', 'Corporate Accounting', 'Tax Advisory', 'Forensic Accounting', 'CFO Track'],
        url: 'https://www.aicpa.org'
      },
      // TECHNOLOGY
      {
        name: 'CompTIA A+',
        organization: 'CompTIA',
        field: 'Information Technology (Entry Level)',
        levels: 'Two exam parts',
        timeToComplete: '1-3 months of study',
        cost: '~$500 (two exam vouchers)',
        requirements: 'No formal prerequisites (recommended: 9-12 months IT experience)',
        salaryImpact: 'Entry IT roles: $40,000-$55,000. The cert helps get your foot in the door.',
        studentTip: 'Best entry-level IT cert. Earn it during college to qualify for help desk and IT support roles. Pairs well with any major.',
        careers: ['IT Support Specialist', 'Help Desk Analyst', 'Field Service Technician'],
        url: 'https://www.comptia.org/certifications/a'
      },
      {
        name: 'CompTIA Security+',
        organization: 'CompTIA',
        field: 'Cybersecurity',
        levels: 'Single exam',
        timeToComplete: '2-4 months of study',
        cost: '~$400 (exam voucher)',
        requirements: 'CompTIA A+ or Network+ recommended (not required)',
        salaryImpact: 'Cybersecurity analyst starting salary: $65,000-$85,000. Required for many DoD positions.',
        studentTip: 'Cybersecurity has a massive talent shortage. This cert plus a bachelor\'s degree makes you very competitive. Required for government/defense cybersecurity work.',
        careers: ['Cybersecurity Analyst', 'Security Engineer', 'SOC Analyst', 'Information Security'],
        url: 'https://www.comptia.org/certifications/security'
      },
      {
        name: 'AWS Cloud Practitioner',
        organization: 'Amazon Web Services',
        field: 'Cloud Computing',
        levels: 'Entry-level (then Solutions Architect, etc.)',
        timeToComplete: '1-2 months of study',
        cost: '$100 (exam fee)',
        requirements: 'No prerequisites',
        salaryImpact: 'AWS-certified professionals earn 25-30% more on average in tech roles',
        studentTip: 'Cloud skills are in massive demand. Start with Cloud Practitioner, then pursue Solutions Architect Associate. AWS offers free training and student credits.',
        careers: ['Cloud Engineer', 'DevOps Engineer', 'Solutions Architect', 'Cloud Consultant'],
        url: 'https://aws.amazon.com/certification/'
      },
      {
        name: 'Google Data Analytics Certificate',
        organization: 'Google (via Coursera)',
        field: 'Data Analytics',
        levels: 'Single certificate program (8 courses)',
        timeToComplete: '3-6 months at 10 hrs/week',
        cost: '~$200-$300 (Coursera subscription)',
        requirements: 'No prerequisites, no degree required',
        salaryImpact: 'Data analysts earn median $82,000 (BLS). The cert helps career changers and supplements any major.',
        studentTip: 'This is one of the best bang-for-buck credentials. Teaches SQL, R, Tableau, and data visualization. Pairs excellently with business, social science, or health majors.',
        careers: ['Data Analyst', 'Business Intelligence Analyst', 'Marketing Analyst', 'Operations Analyst'],
        url: 'https://grow.google/certificates/data-analytics/'
      },
      // PROJECT MANAGEMENT
      {
        name: 'CAPM (Certified Associate in Project Management)',
        organization: 'PMI (Project Management Institute)',
        field: 'Project Management',
        levels: 'Entry-level (step before PMP)',
        timeToComplete: '2-3 months of study',
        cost: '~$400 (exam + PMI membership)',
        requirements: '23 hours of project management education (free options available)',
        salaryImpact: 'Project coordinator/analyst starting: $50,000-$65,000. PMP holders earn median $116,000.',
        studentTip: 'Great addition to ANY major. Project management skills are needed everywhere. Earn CAPM in college, then get PMP after 3 years of work experience.',
        careers: ['Project Coordinator', 'Business Analyst', 'Program Manager', 'Operations Manager'],
        url: 'https://www.pmi.org/certifications/capm'
      },
      // HUMAN RESOURCES
      {
        name: 'SHRM-CP',
        organization: 'SHRM (Society for Human Resource Management)',
        field: 'Human Resources',
        levels: 'CP (entry) and SCP (senior)',
        timeToComplete: '3-6 months of study',
        cost: '~$500 (exam fee, discounted for students)',
        requirements: 'HR-related bachelor\'s degree or 1 year HR experience',
        salaryImpact: 'HR specialists with SHRM-CP earn $60,000-$75,000 starting',
        studentTip: 'If you\'re interested in people-focused business roles, HR is growing and well-compensated. SHRM offers student membership and resources.',
        careers: ['HR Specialist', 'Recruiter', 'Compensation Analyst', 'Training & Development', 'HR Business Partner'],
        url: 'https://www.shrm.org/certification'
      }
    ],
    naceSalaryData: {
      source: 'NACE (National Association of Colleges and Employers)',
      description: 'NACE tracks starting salary offers for new college graduates by major.',
      highlights: [
        { major: 'Computer Science', avgStarting: '$80,000', trend: 'Stable/growing' },
        { major: 'Engineering (all)', avgStarting: '$75,000', trend: 'Stable' },
        { major: 'Business (Finance focus)', avgStarting: '$62,000', trend: 'Growing' },
        { major: 'Accounting', avgStarting: '$58,000', trend: 'Stable' },
        { major: 'Health Sciences', avgStarting: '$55,000', trend: 'Growing' },
        { major: 'Communications', avgStarting: '$45,000', trend: 'Flat' },
        { major: 'Liberal Arts', avgStarting: '$42,000', trend: 'Flat' },
        { major: 'Education', avgStarting: '$40,000', trend: 'Slow growth' }
      ],
      topSkillsEmployersWant: [
        'Problem-solving / critical thinking',
        'Teamwork / collaboration',
        'Written communication',
        'Data analysis / quantitative skills',
        'Technical / digital literacy',
        'Leadership',
        'Work ethic / initiative'
      ]
    }
  };
}

export async function runCertificationsScraper() {
  console.log('\n=== Professional Certifications Scraper ===\n');

  const data = getCertificationData();
  await saveScrapedData('certifications.json', data);

  const md = generateCertsMarkdown(data);
  await saveScrapedData('certifications-guide.md', { content: md });

  console.log(`  Compiled ${data.certifications.length} certification profiles`);
  console.log(`  Compiled NACE salary data for ${data.naceSalaryData.highlights.length} majors`);

  return data;
}

function generateCertsMarkdown(data) {
  let md = '# Professional Certifications Guide for College Students\n\n';
  md += `*Source: Compiled from CFA Institute, AICPA, CompTIA, PMI, AWS, Google, SHRM*\n`;
  md += `*Updated: ${new Date().toISOString()}*\n\n`;

  md += '## Why Certifications Matter\n\n';
  md += 'Certifications complement your degree by proving specific, verifiable skills. ';
  md += 'For students, they are a way to stand out when you lack work experience. ';
  md += 'Many can be started or completed while still in college.\n\n';

  for (const cert of data.certifications) {
    md += `## ${cert.name}\n`;
    md += `**Organization**: ${cert.organization}\n`;
    md += `**Field**: ${cert.field}\n`;
    md += `**Time to complete**: ${cert.timeToComplete}\n`;
    md += `**Cost**: ${cert.cost}\n`;
    md += `**Requirements**: ${cert.requirements}\n`;
    md += `**Salary impact**: ${cert.salaryImpact}\n`;
    md += `**Tip for students**: ${cert.studentTip}\n`;
    md += `**Career paths**: ${cert.careers.join(', ')}\n\n`;
  }

  md += '## NACE Starting Salary Data\n\n';
  md += '*Source: National Association of Colleges and Employers*\n\n';
  for (const item of data.naceSalaryData.highlights) {
    md += `- **${item.major}**: ${item.avgStarting} average starting salary (${item.trend})\n`;
  }

  md += '\n## Top Skills Employers Want (NACE Survey)\n\n';
  for (const skill of data.naceSalaryData.topSkillsEmployersWant) {
    md += `- ${skill}\n`;
  }

  return md;
}

if (process.argv[1] && process.argv[1].includes('certifications-scraper')) {
  runCertificationsScraper().catch(console.error);
}
