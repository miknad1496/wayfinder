/**
 * BLS Occupational Outlook Handbook Scraper
 *
 * Fetches occupation data from the BLS public API and OOH pages.
 * Data includes: job title, median pay, growth outlook, education requirements,
 * job description, and work environment.
 *
 * Source: https://www.bls.gov/ooh/
 * API: https://api.bls.gov/publicAPI/v2/
 */

import * as cheerio from 'cheerio';
import { fetchHTML, fetchJSON, saveScrapedData, sleep, cleanText } from './utils.js';

// Major BLS occupation groups and their OOH URLs
const OOH_GROUPS = [
  { group: 'Business and Financial', url: 'https://www.bls.gov/ooh/business-and-financial/home.htm' },
  { group: 'Computer and Information Technology', url: 'https://www.bls.gov/ooh/computer-and-information-technology/home.htm' },
  { group: 'Architecture and Engineering', url: 'https://www.bls.gov/ooh/architecture-and-engineering/home.htm' },
  { group: 'Healthcare', url: 'https://www.bls.gov/ooh/healthcare/home.htm' },
  { group: 'Education Training and Library', url: 'https://www.bls.gov/ooh/education-training-and-library/home.htm' },
  { group: 'Arts and Design', url: 'https://www.bls.gov/ooh/arts-and-design/home.htm' },
  { group: 'Media and Communication', url: 'https://www.bls.gov/ooh/media-and-communication/home.htm' },
  { group: 'Management', url: 'https://www.bls.gov/ooh/management/home.htm' },
  { group: 'Legal', url: 'https://www.bls.gov/ooh/legal/home.htm' },
  { group: 'Life Physical and Social Science', url: 'https://www.bls.gov/ooh/life-physical-and-social-science/home.htm' },
  { group: 'Community and Social Service', url: 'https://www.bls.gov/ooh/community-and-social-service/home.htm' },
  { group: 'Sales', url: 'https://www.bls.gov/ooh/sales/home.htm' },
  { group: 'Office and Administrative Support', url: 'https://www.bls.gov/ooh/office-and-administrative-support/home.htm' }
];

// Scrape the occupation listing page to get individual occupation URLs
async function getOccupationLinks(groupUrl) {
  try {
    const html = await fetchHTML(groupUrl);
    const $ = cheerio.load(html);
    const links = [];

    // OOH pages list occupations in a table or list
    $('a[href*="/ooh/"]').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href && text && !href.includes('home.htm') && !href.includes('#') && text.length > 3) {
        const fullUrl = href.startsWith('http') ? href : `https://www.bls.gov${href}`;
        if (fullUrl.includes('/ooh/') && !links.some(l => l.url === fullUrl)) {
          links.push({ title: text, url: fullUrl });
        }
      }
    });

    return links;
  } catch (err) {
    console.warn(`  Warning: Could not fetch ${groupUrl}: ${err.message}`);
    return [];
  }
}

// Scrape individual occupation page
async function scrapeOccupation(url, group) {
  try {
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim() || $('title').text().split(':')[0].trim();

    // Extract key data points from the summary table
    const summaryData = {};
    $('.summary-table tr, #tab-1 table tr').each((_, row) => {
      const label = $(row).find('td').first().text().trim().toLowerCase();
      const value = $(row).find('td').last().text().trim();
      if (label && value && label !== value) {
        if (label.includes('median pay')) summaryData.medianPay = value;
        if (label.includes('entry-level education')) summaryData.education = value;
        if (label.includes('work experience')) summaryData.workExperience = value;
        if (label.includes('job outlook') || label.includes('growth')) summaryData.outlook = value;
        if (label.includes('number of jobs')) summaryData.numberOfJobs = value;
      }
    });

    // Extract what-they-do section
    let description = '';
    const whatTheyDo = $('#tab-1, .what-they-do');
    if (whatTheyDo.length) {
      description = cleanText(whatTheyDo.find('p').first().text());
    }
    if (!description) {
      description = cleanText($('meta[name="description"]').attr('content') || '');
    }

    // Extract how to become one
    let howToBecome = '';
    const educationSection = $('#tab-4');
    if (educationSection.length) {
      howToBecome = cleanText(educationSection.find('p').slice(0, 3).text());
    }

    return {
      occupation: title,
      group,
      url,
      medianPay: summaryData.medianPay || 'Not available',
      education: summaryData.education || 'Not available',
      workExperience: summaryData.workExperience || 'None',
      outlook: summaryData.outlook || 'Not available',
      numberOfJobs: summaryData.numberOfJobs || 'Not available',
      description: description || 'No description available',
      howToBecome: howToBecome || 'See BLS page for details',
      source: 'BLS Occupational Outlook Handbook',
      scrapedAt: new Date().toISOString()
    };
  } catch (err) {
    console.warn(`  Warning: Could not scrape ${url}: ${err.message}`);
    return null;
  }
}

export async function runBLSScraper() {
  console.log('\n=== BLS Occupational Outlook Handbook Scraper ===\n');
  const allOccupations = [];

  for (const group of OOH_GROUPS) {
    console.log(`Scraping group: ${group.group}...`);
    const links = await getOccupationLinks(group.url);
    console.log(`  Found ${links.length} occupations`);

    for (const link of links.slice(0, 15)) { // Limit per group to be respectful
      const data = await scrapeOccupation(link.url, group.group);
      if (data) {
        allOccupations.push(data);
        process.stdout.write('.');
      }
      await sleep(500); // Rate limiting - be kind to BLS servers
    }
    console.log('');
  }

  console.log(`\nTotal occupations scraped: ${allOccupations.length}`);
  await saveScrapedData('bls-occupations.json', allOccupations);

  // Also create a knowledge-base-friendly markdown version
  const markdown = generateBLSMarkdown(allOccupations);
  await saveScrapedData('bls-occupations.md', { content: markdown });

  return allOccupations;
}

function generateBLSMarkdown(occupations) {
  let md = '# BLS Occupational Outlook Handbook Data\n\n';
  md += `*Scraped: ${new Date().toISOString()}*\n`;
  md += `*Source: Bureau of Labor Statistics (bls.gov/ooh)*\n\n`;

  const grouped = {};
  for (const occ of occupations) {
    if (!grouped[occ.group]) grouped[occ.group] = [];
    grouped[occ.group].push(occ);
  }

  for (const [group, occs] of Object.entries(grouped)) {
    md += `## ${group}\n\n`;
    for (const occ of occs) {
      md += `### ${occ.occupation}\n`;
      md += `- **Median Pay**: ${occ.medianPay}\n`;
      md += `- **Education Required**: ${occ.education}\n`;
      md += `- **Job Outlook**: ${occ.outlook}\n`;
      md += `- **Number of Jobs**: ${occ.numberOfJobs}\n`;
      md += `- **Description**: ${occ.description}\n`;
      md += `- **How to Become One**: ${occ.howToBecome}\n\n`;
    }
  }

  return md;
}

// Run if called directly
if (process.argv[1] && process.argv[1].includes('bls-scraper')) {
  runBLSScraper().catch(console.error);
}
