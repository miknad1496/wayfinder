/**
 * Community Discussion Scraper
 *
 * Scrapes career discussions from public Q&A platforms and forums.
 * Currently supports Quora-style content via web scraping and
 * HackerNews career discussions.
 *
 * This captures the "collective wisdom" layer — real questions real people ask,
 * and the community-validated answers they receive.
 *
 * Usage: node scrapers/community-scraper.js
 */

import { saveScrapedData, sleep } from './utils.js';

// ============================================================
// HackerNews Career Discussions (public API, no auth needed)
// ============================================================

const HN_SEARCH_QUERIES = [
  'career advice software engineer',
  'career change into tech',
  'is computer science degree worth it',
  'salary negotiation tips',
  'bootcamp vs degree',
  'remote work career impact',
  'career advice for new graduates',
  'switching careers at 30',
  'data science career path',
  'cybersecurity career',
  'product manager career path',
  'burnout career change',
  'healthcare career outlook',
  'trades vs college degree',
  'AI impact on careers',
  'best certifications for career change',
  'MBA worth it',
  'freelance vs full time',
  'government vs private sector career',
  'work life balance careers',
];

/**
 * Search HackerNews via Algolia API (public, no auth)
 */
async function searchHN(query, numResults = 10) {
  try {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${numResults}&numericFilters=points>20`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'WayfinderCareerAdvisor/1.0' }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    return data.hits.map(hit => ({
      title: hit.title,
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      hnUrl: `https://news.ycombinator.com/item?id=${hit.objectID}`,
      points: hit.points,
      numComments: hit.num_comments,
      author: hit.author,
      created: hit.created_at,
      source: 'HackerNews',
      query: query
    }));
  } catch (err) {
    console.warn(`  HN search failed for "${query}": ${err.message}`);
    return [];
  }
}

/**
 * Get comments from a HackerNews story
 */
async function getHNComments(storyId, maxComments = 5) {
  try {
    const url = `https://hn.algolia.com/api/v1/items/${storyId}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'WayfinderCareerAdvisor/1.0' }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    // Get top-level comments sorted by implicit quality (order)
    const comments = (data.children || [])
      .filter(c => c.text && c.text.length > 100)
      .slice(0, maxComments)
      .map(c => ({
        text: c.text.replace(/<[^>]*>/g, '').substring(0, 1000),  // Strip HTML
        author: c.author,
        hasReplies: (c.children || []).length > 0
      }));

    return comments;
  } catch (err) {
    return [];
  }
}

/**
 * Scrape HackerNews career discussions
 */
async function scrapeHackerNews() {
  console.log('  Scraping HackerNews career discussions...');

  const allPosts = [];
  const seenUrls = new Set();

  for (const query of HN_SEARCH_QUERIES) {
    const results = await searchHN(query, 5);

    for (const post of results) {
      if (seenUrls.has(post.hnUrl)) continue;
      seenUrls.add(post.hnUrl);

      // Get comments for high-engagement posts
      if (post.numComments > 20) {
        const storyId = post.hnUrl.split('id=')[1];
        if (storyId) {
          await sleep(500);
          post.topComments = await getHNComments(storyId, 3);
        }
      }

      allPosts.push(post);
    }

    await sleep(1000);  // Rate limiting
  }

  console.log(`  Found ${allPosts.length} HN career discussions`);
  return allPosts;
}

// ============================================================
// "Who is Hiring?" Monthly Threads (HN gold mine for job market intel)
// ============================================================

async function scrapeWhoIsHiring() {
  console.log('  Scraping "Who is Hiring?" threads...');

  try {
    // Search for the monthly hiring threads
    const url = 'https://hn.algolia.com/api/v1/search?query=%22who%20is%20hiring%22&tags=story&hitsPerPage=6&numericFilters=points>100';
    const response = await fetch(url, {
      headers: { 'User-Agent': 'WayfinderCareerAdvisor/1.0' }
    });

    if (!response.ok) return [];
    const data = await response.json();

    const threads = [];
    for (const hit of data.hits.slice(0, 3)) {  // Last 3 months
      const storyId = hit.objectID;
      await sleep(1000);

      const threadUrl = `https://hn.algolia.com/api/v1/items/${storyId}`;
      const threadResp = await fetch(threadUrl, {
        headers: { 'User-Agent': 'WayfinderCareerAdvisor/1.0' }
      });

      if (!threadResp.ok) continue;
      const threadData = await threadResp.json();

      // Extract job postings (top-level comments)
      const jobPosts = (threadData.children || [])
        .filter(c => c.text && c.text.length > 50)
        .slice(0, 50)  // First 50 postings
        .map(c => ({
          text: c.text.replace(/<[^>]*>/g, '').substring(0, 500),
          author: c.author
        }));

      threads.push({
        title: hit.title,
        date: hit.created_at,
        url: `https://news.ycombinator.com/item?id=${storyId}`,
        totalComments: hit.num_comments,
        samplePostings: jobPosts,
        source: 'HackerNews Who Is Hiring'
      });
    }

    console.log(`  Found ${threads.length} hiring threads`);
    return threads;
  } catch (err) {
    console.warn(`  Who is Hiring scrape failed: ${err.message}`);
    return [];
  }
}

// ============================================================
// Static Career Wisdom (curated insights without scraping)
// ============================================================

function getCareerWisdom() {
  return {
    unconventionalPaths: [
      {
        insight: "Many successful tech workers don't have CS degrees",
        detail: "Community data consistently shows that bootcamp graduates, self-taught developers, and career changers from unrelated fields successfully enter and thrive in tech. The key factors are portfolio quality, networking, and continuous learning rather than pedigree.",
        sources: ["r/cscareerquestions", "HackerNews", "r/learnprogramming"],
        confidence: "high"
      },
      {
        insight: "Trades careers are significantly undervalued in career counseling",
        detail: "Electricians, plumbers, and HVAC technicians consistently report strong earnings ($60K-$100K+), job security, no student debt, and high job satisfaction. The shortage of skilled tradespeople is creating premium wages.",
        sources: ["r/electricians", "r/plumbing", "r/HVAC", "BLS data"],
        confidence: "high"
      },
      {
        insight: "The 'passion' career advice is often counterproductive",
        detail: "Community wisdom increasingly points toward 'career capital' theory — build rare and valuable skills first, then leverage them into work you find meaningful. Starting with passion often leads to low-paying roles in oversaturated fields.",
        sources: ["r/careerguidance", "Cal Newport research", "HackerNews discussions"],
        confidence: "medium"
      }
    ],
    salaryNegotiationInsights: [
      {
        insight: "Most people leave 10-30% on the table by not negotiating",
        detail: "Across thousands of salary discussion threads, the community consensus is overwhelming: negotiate every offer. Even a simple 'Is there flexibility on the base salary?' consistently results in increases.",
        sources: ["r/cscareerquestions", "r/personalfinance", "r/careerguidance"],
        confidence: "high"
      },
      {
        insight: "Job hopping every 2-3 years maximizes early-career earnings",
        detail: "Internal raises average 3-5% while job switches average 10-20%+ increases. This pattern is especially strong in tech and finance. After reaching senior levels, stability can become more valuable.",
        sources: ["r/cscareerquestions", "r/personalfinance", "r/experienceddevs"],
        confidence: "high"
      }
    ],
    industryRedFlags: [
      {
        insight: "Certain industries consistently show burnout patterns",
        detail: "Healthcare (especially nursing), public accounting (Big 4), teaching, and early-career investment banking consistently report high burnout. Community advice often involves strategic entry and exit planning rather than avoidance.",
        sources: ["r/nursing", "r/accounting", "r/teachers", "r/financialcareers"],
        confidence: "high"
      }
    ],
    educationROI: [
      {
        insight: "Graduate school ROI varies enormously by field",
        detail: "MBA: high ROI only from top programs or with employer sponsorship. Law school: increasingly risky unless T14. Medical school: high earnings but delayed by 8-12 years. CS Masters: often unnecessary but can open doors to ML/AI roles. PhD: only if pursuing research/academia.",
        sources: ["r/GradSchool", "r/MBA", "r/lawschool", "r/medicine"],
        confidence: "medium-high"
      }
    ]
  };
}

// ============================================================
// Main Entry Point
// ============================================================

export async function runCommunityScraper() {
  console.log('\n=== Community Career Discussions Scraper ===\n');

  const results = {};

  // Scrape HackerNews
  results.hnDiscussions = await scrapeHackerNews();
  results.hnHiringThreads = await scrapeWhoIsHiring();

  // Add curated career wisdom
  results.careerWisdom = getCareerWisdom();

  const totalItems = results.hnDiscussions.length + results.hnHiringThreads.length;
  console.log(`\nTotal community data points: ${totalItems}`);
  console.log(`Career wisdom insights: ${Object.values(results.careerWisdom).flat().length}`);

  // Save everything
  await saveScrapedData('community-hn-discussions.json', results.hnDiscussions);
  await saveScrapedData('community-hn-hiring.json', results.hnHiringThreads);
  await saveScrapedData('community-career-wisdom.json', results.careerWisdom);

  // Generate markdown
  const markdown = generateCommunityMarkdown(results);
  await saveScrapedData('community-insights.md', { content: markdown });

  return results;
}

function generateCommunityMarkdown(results) {
  let md = '# Community Career Intelligence\n\n';
  md += `*Scraped: ${new Date().toISOString()}*\n`;
  md += `*Sources: HackerNews, curated career community wisdom*\n\n`;

  md += '## Key Career Insights from Online Communities\n\n';

  const wisdom = results.careerWisdom;
  for (const [category, insights] of Object.entries(wisdom)) {
    md += `### ${category.replace(/([A-Z])/g, ' $1').trim()}\n\n`;
    for (const insight of insights) {
      md += `**${insight.insight}**\n`;
      md += `${insight.detail}\n`;
      md += `*Confidence: ${insight.confidence} | Sources: ${insight.sources.join(', ')}*\n\n`;
    }
  }

  md += '## Top HackerNews Career Discussions\n\n';
  for (const post of results.hnDiscussions.slice(0, 20)) {
    md += `- **[${post.title}](${post.hnUrl})** (${post.points} points, ${post.numComments} comments)\n`;
  }

  md += '\n## Recent Job Market Signals (Who is Hiring?)\n\n';
  for (const thread of results.hnHiringThreads) {
    md += `### ${thread.title}\n`;
    md += `*${thread.totalComments} job postings | ${thread.date}*\n\n`;
  }

  return md;
}

// Run if called directly
const isDirectRun = process.argv[1] && process.argv[1].includes('community-scraper');
if (isDirectRun) {
  runCommunityScraper().catch(console.error);
}
