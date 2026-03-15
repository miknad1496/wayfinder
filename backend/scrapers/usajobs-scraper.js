/**
 * USAJobs & Government Opportunities Scraper
 *
 * Fetches government career data including:
 * - Entry-level federal job listings (USAJobs API)
 * - Pathways program (internships for students)
 * - General government career pathway info
 *
 * API: https://developer.usajobs.gov/
 * Also scrapes grants.gov for student-relevant grants
 */

import { fetchJSON, fetchHTML, saveScrapedData, sleep, cleanText } from './utils.js';
import * as cheerio from 'cheerio';

// USAJobs API search for entry-level positions
async function fetchUSAJobsListings(apiKey, email) {
  console.log('  Fetching USAJobs entry-level listings...');

  const headers = {};
  if (apiKey && email) {
    headers['Authorization-Key'] = apiKey;
    headers['User-Agent'] = email;
  }

  const searchTerms = [
    'Pathways Recent Graduates',
    'Pathways Intern',
    'entry level analyst',
    'entry level specialist',
    'junior developer',
    'student trainee'
  ];

  const allJobs = [];

  for (const term of searchTerms) {
    try {
      const url = `https://data.usajobs.gov/api/Search?` + new URLSearchParams({
        Keyword: term,
        ResultsPerPage: '10',
        PayGradeLow: '5',
        PayGradeHigh: '9'
      });

      const data = await fetchJSON(url, { headers });
      if (data.SearchResult?.SearchResultItems) {
        for (const item of data.SearchResult.SearchResultItems) {
          const job = item.MatchedObjectDescriptor;
          allJobs.push({
            title: job.PositionTitle,
            organization: job.OrganizationName,
            department: job.DepartmentName,
            location: job.PositionLocationDisplay,
            payRange: `$${job.PositionRemuneration?.[0]?.MinimumRange || 'N/A'} - $${job.PositionRemuneration?.[0]?.MaximumRange || 'N/A'}`,
            grade: `GS-${job.UserArea?.Details?.LowGrade || '?'} to GS-${job.UserArea?.Details?.HighGrade || '?'}`,
            qualificationSummary: cleanText(job.QualificationSummary || '').substring(0, 300),
            url: job.PositionURI,
            closingDate: job.ApplicationCloseDate
          });
        }
      }
      await sleep(500);
    } catch (err) {
      console.warn(`  Warning: USAJobs search for "${term}" failed: ${err.message}`);
    }
  }

  return allJobs;
}

// Static government career pathway data (always available, no API needed)
function getGovernmentCareerPathways() {
  return {
    title: 'Government Career Pathways for Students',
    source: 'USAJobs.gov / OPM Pathways Programs',
    lastUpdated: new Date().toISOString(),
    pathways: [
      {
        program: 'Pathways Internship Program',
        eligibility: 'Currently enrolled students (high school through graduate school)',
        description: 'Provides students in high schools, colleges, trade schools, and other qualifying educational institutions with paid work opportunities in federal agencies.',
        duration: 'During enrollment period, may lead to permanent position',
        pay: 'GS-2 to GS-7 depending on education level',
        howToApply: 'Search "Pathways Intern" on usajobs.gov, must be currently enrolled'
      },
      {
        program: 'Recent Graduates Program',
        eligibility: 'Graduated within past 2 years (6 years for veterans)',
        description: 'Full-time positions for recent graduates. Includes formal training, mentoring, and career development.',
        duration: '1 year with conversion to permanent position possible',
        pay: 'GS-5 to GS-9 typically',
        howToApply: 'Search "Pathways Recent Graduates" on usajobs.gov'
      },
      {
        program: 'Presidential Management Fellows (PMF)',
        eligibility: 'Graduate degree completed within past 2 years',
        description: 'The most prestigious federal entry program. 2-year fellowship with rotational assignments, training, and mentorship.',
        duration: '2 years, converts to permanent GS-12/13',
        pay: 'GS-9 to GS-12',
        howToApply: 'Apply at pmf.gov during the annual open season (typically fall)'
      }
    ],
    generalGovCareers: [
      {
        area: 'Federal Pay Scale (GS)',
        details: 'Entry-level college grads typically start at GS-5 ($33,693) or GS-7 ($41,637). With a master\'s, GS-9 ($50,748). Pay varies by locality. Within 3-5 years, most professionals reach GS-11 ($61,592) or GS-12 ($73,789). Senior positions: GS-13 ($87,758) to GS-15 ($128,078).'
      },
      {
        area: 'Benefits',
        details: 'Federal employees receive: health insurance (FEHB — government pays 70-75%), pension (FERS — defined benefit + TSP 401k with 5% match), 13-26 days annual leave per year, 13 sick days, 11 paid holidays, student loan repayment programs (up to $10,000/year), and job security.'
      },
      {
        area: 'Public Service Loan Forgiveness (PSLF)',
        details: 'After 120 qualifying payments (10 years) while working for the government, remaining federal student loan balance is forgiven. This is a major financial benefit for graduates with high loan balances.'
      },
      {
        area: 'Security Clearances',
        details: 'Some positions require clearances (Secret, Top Secret, TS/SCI). Having a clearance significantly increases career options and earning potential, especially in defense and intelligence. Clearance is granted by the employer, not something you apply for independently.'
      }
    ],
    visaAndImmigration: [
      {
        topic: 'Federal Employment and Citizenship',
        details: 'Most federal jobs require U.S. citizenship. Some agencies can hire non-citizens for hard-to-fill positions. Check individual job listings for requirements.'
      },
      {
        topic: 'OPT (Optional Practical Training)',
        details: 'International students on F-1 visas get 12 months of work authorization after graduation. STEM majors get an additional 24-month extension (total 36 months). This is the primary path for international students to gain U.S. work experience.'
      },
      {
        topic: 'H-1B Visa',
        details: 'Employer-sponsored work visa. Annual cap of 65,000 + 20,000 for U.S. master\'s holders. Highly competitive lottery system. STEM, healthcare, and tech companies are the most frequent sponsors.'
      },
      {
        topic: 'Industries Most Likely to Sponsor Visas',
        details: 'Technology (Google, Amazon, Microsoft, Meta), consulting (Deloitte, McKinsey, BCG), finance (Goldman Sachs, JP Morgan), healthcare systems, and universities. Check myvisajobs.com for company-specific H-1B data.'
      }
    ]
  };
}

export async function runUSAJobsScraper() {
  console.log('\n=== Government Careers & USAJobs Scraper ===\n');

  // Always save the static pathway data
  const pathways = getGovernmentCareerPathways();
  await saveScrapedData('government-pathways.json', pathways);

  // Try USAJobs API if credentials available
  const apiKey = process.env.USAJOBS_API_KEY;
  const email = process.env.USAJOBS_EMAIL;

  if (apiKey && email) {
    const jobs = await fetchUSAJobsListings(apiKey, email);
    console.log(`  Found ${jobs.length} entry-level federal jobs`);
    await saveScrapedData('usajobs-listings.json', jobs);
  } else {
    console.log('  No USAJOBS_API_KEY set. Using static pathway data only.');
    console.log('  Get a free API key at developer.usajobs.gov for live job listings.');
  }

  // Generate markdown
  const md = generateGovMarkdown(pathways);
  await saveScrapedData('government-careers.md', { content: md });

  return pathways;
}

function generateGovMarkdown(pathways) {
  let md = '# Government Career Pathways for Students\n\n';
  md += `*Source: USAJobs.gov, OPM.gov*\n`;
  md += `*Updated: ${new Date().toISOString()}*\n\n`;

  md += '## Student & Recent Graduate Programs\n\n';
  for (const p of pathways.pathways) {
    md += `### ${p.program}\n`;
    md += `**Eligibility**: ${p.eligibility}\n`;
    md += `**What it is**: ${p.description}\n`;
    md += `**Duration**: ${p.duration}\n`;
    md += `**Pay**: ${p.pay}\n`;
    md += `**How to apply**: ${p.howToApply}\n\n`;
  }

  md += '## Federal Career Basics\n\n';
  for (const item of pathways.generalGovCareers) {
    md += `### ${item.area}\n${item.details}\n\n`;
  }

  md += '## Visa & Immigration for International Students\n\n';
  for (const item of pathways.visaAndImmigration) {
    md += `### ${item.topic}\n${item.details}\n\n`;
  }

  return md;
}

if (process.argv[1] && process.argv[1].includes('usajobs-scraper')) {
  runUSAJobsScraper().catch(console.error);
}
