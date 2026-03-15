/**
 * O*NET Online Data Scraper
 *
 * O*NET (Occupational Information Network) provides detailed occupation data
 * including skills, interests, work values, and the RIASEC interest model.
 *
 * Uses the O*NET Web Services API: https://services.onetcenter.org/
 * Note: The public API requires registration for high-volume use.
 * This scraper uses the publicly available data files and web pages.
 *
 * Source: https://www.onetonline.org/
 */

import * as cheerio from 'cheerio';
import { fetchHTML, saveScrapedData, sleep, cleanText } from './utils.js';

// Key career clusters aligned with college student interests
const CAREER_CLUSTERS = [
  { name: 'Business Management & Administration', code: '04' },
  { name: 'Finance', code: '06' },
  { name: 'Health Science', code: '08' },
  { name: 'Information Technology', code: '11' },
  { name: 'Science Technology Engineering & Mathematics', code: '15' },
  { name: 'Arts Audio/Video Technology & Communications', code: '03' },
  { name: 'Education & Training', code: '05' },
  { name: 'Government & Public Administration', code: '07' },
  { name: 'Law Public Safety Corrections & Security', code: '12' },
  { name: 'Marketing', code: '14' }
];

// Top occupations to scrape for detailed data (SOC codes)
const KEY_OCCUPATIONS = [
  { soc: '15-1252.00', title: 'Software Developers' },
  { soc: '15-2051.00', title: 'Data Scientists' },
  { soc: '13-2011.00', title: 'Accountants and Auditors' },
  { soc: '13-2051.00', title: 'Financial Analysts' },
  { soc: '11-1021.00', title: 'General and Operations Managers' },
  { soc: '29-1141.00', title: 'Registered Nurses' },
  { soc: '15-1212.00', title: 'Information Security Analysts' },
  { soc: '13-1161.00', title: 'Market Research Analysts' },
  { soc: '27-1024.00', title: 'Graphic Designers' },
  { soc: '25-1011.00', title: 'Business Teachers Postsecondary' },
  { soc: '19-3031.00', title: 'Clinical and Counseling Psychologists' },
  { soc: '11-2021.00', title: 'Marketing Managers' },
  { soc: '15-2031.00', title: 'Operations Research Analysts' },
  { soc: '13-1111.00', title: 'Management Analysts (Consultants)' },
  { soc: '29-1071.00', title: 'Physician Assistants' },
  { soc: '17-2199.00', title: 'Engineers All Other' },
  { soc: '21-1012.00', title: 'Educational Guidance Counselors' },
  { soc: '23-1011.00', title: 'Lawyers' },
  { soc: '19-1042.00', title: 'Medical Scientists' },
  { soc: '13-2052.00', title: 'Personal Financial Advisors' },
  { soc: '15-1241.00', title: 'Computer Network Architects' },
  { soc: '11-3031.00', title: 'Financial Managers' },
  { soc: '29-1228.00', title: 'Physicians All Other' },
  { soc: '27-3041.00', title: 'Technical Writers' },
  { soc: '13-1071.00', title: 'Human Resources Specialists' }
];

async function scrapeOccupationPage(soc, title) {
  const url = `https://www.onetonline.org/link/summary/${soc}`;

  try {
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    // Extract tasks
    const tasks = [];
    $('.section_Tasks li, #Tasks li').each((_, el) => {
      tasks.push(cleanText($(el).text()));
    });

    // Extract skills
    const skills = [];
    $('.section_Skills li, #Skills li').each((_, el) => {
      const text = cleanText($(el).text());
      if (text) skills.push(text);
    });

    // Extract knowledge areas
    const knowledge = [];
    $('.section_Knowledge li, #Knowledge li').each((_, el) => {
      const text = cleanText($(el).text());
      if (text) knowledge.push(text);
    });

    // Extract education/training
    const education = [];
    $('.section_Education li, #Education li, .section_Job_Zone li').each((_, el) => {
      const text = cleanText($(el).text());
      if (text) education.push(text);
    });

    // Extract interests (RIASEC)
    const interests = [];
    $('.section_Interests li, #Interests li').each((_, el) => {
      const text = cleanText($(el).text());
      if (text) interests.push(text);
    });

    // Extract work values
    const workValues = [];
    $('.section_Work_Values li, #Work_Values li').each((_, el) => {
      const text = cleanText($(el).text());
      if (text) workValues.push(text);
    });

    // Extract wages
    let wages = '';
    const wageSection = $('td:contains("Median wages")').next().text() ||
                        $('td:contains("Annual")').next().text();
    if (wageSection) wages = cleanText(wageSection);

    return {
      soc,
      title,
      url,
      tasks: tasks.slice(0, 5),
      skills: skills.slice(0, 8),
      knowledge: knowledge.slice(0, 6),
      education: education.slice(0, 3),
      interests: interests.slice(0, 3),
      workValues: workValues.slice(0, 3),
      wages,
      source: 'O*NET OnLine',
      scrapedAt: new Date().toISOString()
    };
  } catch (err) {
    console.warn(`  Warning: Could not scrape O*NET ${soc}: ${err.message}`);
    return {
      soc,
      title,
      url,
      tasks: [],
      skills: [],
      knowledge: [],
      education: [],
      interests: [],
      workValues: [],
      wages: 'Not available',
      source: 'O*NET OnLine (partial)',
      scrapedAt: new Date().toISOString(),
      error: err.message
    };
  }
}

// RIASEC interest model descriptions for the knowledge base
const RIASEC_MODEL = {
  title: 'Holland RIASEC Interest Model (O*NET)',
  description: 'O*NET uses the Holland Interest Profiler based on six interest types. Students can identify their top 2-3 types to find matching careers.',
  types: {
    Realistic: {
      description: 'Practical, hands-on problem solving. Working with tools, machines, plants, or animals.',
      sampleCareers: 'Engineering, agriculture, construction, environmental science, forensic science',
      collegeClue: 'You enjoy lab work, building things, being outdoors, or hands-on projects'
    },
    Investigative: {
      description: 'Analytical thinking, research, and intellectual problem solving.',
      sampleCareers: 'Data science, research, medicine, economics, psychology research',
      collegeClue: 'You love asking "why?", enjoy research papers, and want to understand how things work'
    },
    Artistic: {
      description: 'Creative expression, innovation, and working in unstructured environments.',
      sampleCareers: 'UX design, marketing creative, journalism, architecture, film production',
      collegeClue: 'You gravitate toward creative projects, dislike rigid rules, and value self-expression'
    },
    Social: {
      description: 'Helping, teaching, counseling, and working with people.',
      sampleCareers: 'Counseling, teaching, HR, social work, public health, nursing',
      collegeClue: 'You volunteer, enjoy group work, and feel energized by helping others succeed'
    },
    Enterprising: {
      description: 'Leading, persuading, managing, and taking business risks.',
      sampleCareers: 'Management consulting, sales, entrepreneurship, law, politics',
      collegeClue: 'You lead clubs, enjoy debates, and think about starting businesses or organizations'
    },
    Conventional: {
      description: 'Organizing, managing data, and following established procedures.',
      sampleCareers: 'Accounting, financial analysis, project management, database administration',
      collegeClue: 'You like spreadsheets, planning, organizing events, and making systems more efficient'
    }
  }
};

export async function runONETScraper() {
  console.log('\n=== O*NET Online Scraper ===\n');
  const occupations = [];

  for (const occ of KEY_OCCUPATIONS) {
    process.stdout.write(`  Scraping ${occ.title}...`);
    const data = await scrapeOccupationPage(occ.soc, occ.title);
    occupations.push(data);
    console.log(' done');
    await sleep(800); // Rate limiting
  }

  console.log(`\nTotal occupations scraped: ${occupations.length}`);

  // Save raw occupation data
  await saveScrapedData('onet-occupations.json', occupations);

  // Save RIASEC model as knowledge base document
  await saveScrapedData('onet-riasec-model.json', RIASEC_MODEL);

  // Generate markdown for knowledge base
  const markdown = generateONETMarkdown(occupations);
  await saveScrapedData('onet-careers.md', { content: markdown });

  return occupations;
}

function generateONETMarkdown(occupations) {
  let md = '# O*NET Career Data\n\n';
  md += `*Source: O*NET OnLine (onetonline.org)*\n`;
  md += `*Scraped: ${new Date().toISOString()}*\n\n`;

  md += '## RIASEC Interest Model\n\n';
  md += 'The Holland RIASEC model categorizes career interests into six types. Most people have 2-3 dominant types.\n\n';
  for (const [type, info] of Object.entries(RIASEC_MODEL.types)) {
    md += `### ${type}\n`;
    md += `${info.description}\n`;
    md += `**Sample careers**: ${info.sampleCareers}\n`;
    md += `**College clue**: ${info.collegeClue}\n\n`;
  }

  md += '## Detailed Occupation Profiles\n\n';
  for (const occ of occupations) {
    md += `### ${occ.title} (${occ.soc})\n`;
    if (occ.wages) md += `**Wages**: ${occ.wages}\n`;
    if (occ.skills.length) md += `**Key Skills**: ${occ.skills.join(', ')}\n`;
    if (occ.knowledge.length) md += `**Knowledge Areas**: ${occ.knowledge.join(', ')}\n`;
    if (occ.interests.length) md += `**Interest Profile**: ${occ.interests.join(', ')}\n`;
    if (occ.tasks.length) md += `**Sample Tasks**: ${occ.tasks.slice(0, 3).join('; ')}\n`;
    md += '\n';
  }

  return md;
}

if (process.argv[1] && process.argv[1].includes('onet-scraper')) {
  runONETScraper().catch(console.error);
}
