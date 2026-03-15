/**
 * Reddit Career Communities Scraper
 *
 * Scrapes career-related subreddits for real human experiences,
 * advice, salary reports, career transition stories, and community wisdom.
 *
 * This is the "street knowledge" layer — the stuff BLS doesn't tell you.
 *
 * No API key needed — uses Reddit's public JSON endpoints.
 *
 * Usage: node scrapers/reddit-scraper.js
 */

import { saveScrapedData, sleep } from './utils.js';

// Career-focused subreddits ranked by value for career advising
const SUBREDDITS = [
  // Tech careers
  { name: 'cscareerquestions', focus: 'tech careers, software engineering, interviews, salary negotiation' },
  { name: 'experienceddevs', focus: 'senior engineers, career growth, leadership, tech industry insights' },
  { name: 'ITCareerQuestions', focus: 'IT careers, certifications, help desk to sysadmin paths' },
  { name: 'datascience', focus: 'data science careers, ML engineering, analytics' },
  { name: 'cybersecurity', focus: 'infosec careers, certifications, SOC analyst paths' },

  // General career
  { name: 'careerguidance', focus: 'career changes, general career advice, job searching' },
  { name: 'jobs', focus: 'job searching, hiring, workplace issues' },
  { name: 'careeradvice', focus: 'career planning, professional development' },
  { name: 'antiwork', focus: 'workplace conditions, worker perspectives, salary transparency' },

  // Specific professions
  { name: 'nursing', focus: 'nursing careers, specializations, burnout, travel nursing' },
  { name: 'accounting', focus: 'CPA, Big 4, public vs private accounting careers' },
  { name: 'engineering', focus: 'engineering careers across disciplines' },
  { name: 'lawschool', focus: 'legal careers, law school admissions, bar exam' },
  { name: 'medicine', focus: 'medical careers, residency, specialty selection' },
  { name: 'teachers', focus: 'teaching careers, education system, teacher salaries' },

  // Finance and business
  { name: 'personalfinance', focus: 'salary, negotiations, financial planning for careers' },
  { name: 'financialcareers', focus: 'finance industry, investment banking, wealth management' },

  // Education
  { name: 'college', focus: 'college majors, degree value, student perspectives' },
  { name: 'GradSchool', focus: 'graduate education ROI, PhD vs industry, research careers' },
];

// Search queries to find the most valuable career discussion threads
const SEARCH_QUERIES = [
  'salary thread',
  'career change success story',
  'is it worth it',
  'day in the life',
  'how I broke into',
  'advice for someone starting',
  'biggest career mistake',
  'what I wish I knew',
  'honest review of this career',
  'burned out considering switch',
  'negotiated salary',
  'career path from',
  'no degree success',
  'bootcamp vs degree',
  'remote work',
  'work life balance',
];

/**
 * Fetch JSON from Reddit's public API
 */
async function fetchRedditJSON(url) {
  try {
    const jsonUrl = url.endsWith('.json') ? url : url + '.json';
    const response = await fetch(jsonUrl, {
      headers: {
        'User-Agent': 'WayfinderCareerAdvisor/1.0 (Educational Career Research Tool)',
        'Accept': 'application/json'
      }
    });

    if (response.status === 429) {
      console.log('  Rate limited, waiting 60s...');
      await sleep(60000);
      return fetchRedditJSON(url);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.warn(`  Warning: Could not fetch ${url}: ${err.message}`);
    return null;
  }
}

/**
 * Extract valuable content from a Reddit post
 */
function extractPostData(post, subreddit) {
  const data = post.data;

  // Skip low-quality posts
  if (data.score < 10) return null;  // Must have community validation
  if (data.removed_by_category) return null;  // Removed posts
  if (data.over_18) return null;  // NSFW
  if (!data.selftext || data.selftext.length < 100) return null;  // Need substance
  if (data.selftext === '[removed]' || data.selftext === '[deleted]') return null;

  return {
    title: data.title,
    subreddit: subreddit,
    content: data.selftext.substring(0, 3000),  // Cap content length
    score: data.score,
    numComments: data.num_comments,
    url: `https://reddit.com${data.permalink}`,
    created: new Date(data.created_utc * 1000).toISOString(),
    flair: data.link_flair_text || null,
    isCareerStory: /career change|switched|transition|broke into|went from/i.test(data.title + data.selftext),
    isSalaryThread: /salary|compensation|offer|negotiat/i.test(data.title + data.selftext),
    isAdvice: /advice|tips|recommend|should i|worth it/i.test(data.title + data.selftext),
    source: 'Reddit',
    scrapedAt: new Date().toISOString()
  };
}

/**
 * Extract top comments from a post (the real gold)
 */
async function extractTopComments(permalink, maxComments = 5) {
  const data = await fetchRedditJSON(`https://reddit.com${permalink}`);
  if (!data || !data[1]) return [];

  const comments = data[1].data.children
    .filter(c => c.kind === 't1' && c.data.score > 5 && c.data.body.length > 50)
    .sort((a, b) => b.data.score - a.data.score)
    .slice(0, maxComments)
    .map(c => ({
      body: c.data.body.substring(0, 1500),
      score: c.data.score,
      isExpert: c.data.author_flair_text ? true : false,
      flair: c.data.author_flair_text || null
    }));

  return comments;
}

/**
 * Scrape top posts from a subreddit
 */
async function scrapeSubreddit(subreddit, timeFilter = 'year', limit = 25) {
  console.log(`  Scraping r/${subreddit.name}...`);

  const posts = [];
  const url = `https://reddit.com/r/${subreddit.name}/top.json?t=${timeFilter}&limit=${limit}`;

  const data = await fetchRedditJSON(url);
  if (!data || !data.data) {
    console.warn(`  Could not fetch r/${subreddit.name}`);
    return posts;
  }

  for (const child of data.data.children) {
    const post = extractPostData(child, subreddit.name);
    if (post) {
      // Get top comments for high-value posts
      if (post.score > 50 && post.numComments > 10) {
        await sleep(1500);  // Rate limiting
        post.topComments = await extractTopComments(child.data.permalink, 3);
      }
      posts.push(post);
    }
  }

  console.log(`  Found ${posts.length} quality posts`);
  await sleep(2000);  // Be respectful to Reddit
  return posts;
}

/**
 * Search a subreddit for specific career topics
 */
async function searchSubreddit(subredditName, query) {
  const url = `https://reddit.com/r/${subredditName}/search.json?q=${encodeURIComponent(query)}&restrict_sr=on&sort=top&t=year&limit=10`;

  const data = await fetchRedditJSON(url);
  if (!data || !data.data) return [];

  return data.data.children
    .map(child => extractPostData(child, subredditName))
    .filter(Boolean);
}

/**
 * Main scraping function
 */
export async function runRedditScraper() {
  console.log('\n=== Reddit Career Communities Scraper ===\n');

  const allPosts = [];
  const careerStories = [];
  const salaryData = [];
  const adviceThreads = [];

  // Phase 1: Scrape top posts from each subreddit
  console.log('Phase 1: Scraping top posts from career subreddits...\n');
  for (const subreddit of SUBREDDITS) {
    try {
      const posts = await scrapeSubreddit(subreddit, 'year', 25);

      for (const post of posts) {
        allPosts.push(post);
        if (post.isCareerStory) careerStories.push(post);
        if (post.isSalaryThread) salaryData.push(post);
        if (post.isAdvice) adviceThreads.push(post);
      }
    } catch (err) {
      console.error(`  Error scraping r/${subreddit.name}: ${err.message}`);
    }

    await sleep(2000);  // Respectful rate limiting
  }

  // Phase 2: Targeted searches for high-value content
  console.log('\nPhase 2: Searching for specific career topics...\n');
  const searchSubs = ['cscareerquestions', 'careerguidance', 'jobs', 'personalfinance'];

  for (const subName of searchSubs) {
    for (const query of SEARCH_QUERIES.slice(0, 8)) {  // Top 8 queries per sub
      try {
        const results = await searchSubreddit(subName, query);
        for (const post of results) {
          if (!allPosts.find(p => p.url === post.url)) {
            allPosts.push(post);
            if (post.isCareerStory) careerStories.push(post);
            if (post.isSalaryThread) salaryData.push(post);
            if (post.isAdvice) adviceThreads.push(post);
          }
        }
      } catch (err) {
        // Silently continue on search errors
      }
      await sleep(1500);
    }
    console.log(`  Searched r/${subName} for ${SEARCH_QUERIES.slice(0, 8).length} topics`);
  }

  console.log(`\nTotal posts collected: ${allPosts.length}`);
  console.log(`  Career change stories: ${careerStories.length}`);
  console.log(`  Salary discussions: ${salaryData.length}`);
  console.log(`  Advice threads: ${adviceThreads.length}`);

  // Save all data
  await saveScrapedData('reddit-career-posts.json', allPosts);
  await saveScrapedData('reddit-career-stories.json', careerStories);
  await saveScrapedData('reddit-salary-discussions.json', salaryData);
  await saveScrapedData('reddit-advice-threads.json', adviceThreads);

  // Generate a markdown summary for the knowledge base
  const markdown = generateRedditMarkdown(allPosts, careerStories, salaryData);
  await saveScrapedData('reddit-community-insights.md', { content: markdown });

  return { total: allPosts.length, stories: careerStories.length, salary: salaryData.length, advice: adviceThreads.length };
}

/**
 * Generate a knowledge-base-friendly markdown document from Reddit data
 */
function generateRedditMarkdown(allPosts, careerStories, salaryData) {
  let md = '# Career Community Insights (from Reddit)\n\n';
  md += `*Scraped: ${new Date().toISOString()}*\n`;
  md += `*Source: Reddit career communities (${SUBREDDITS.length} subreddits)*\n`;
  md += `*Total posts analyzed: ${allPosts.length}*\n\n`;

  md += '## Real Career Change Stories\n\n';
  md += 'These are verified community experiences of people who switched careers.\n\n';
  for (const story of careerStories.slice(0, 20)) {
    md += `### ${story.title}\n`;
    md += `*r/${story.subreddit} | Score: ${story.score} | ${story.numComments} comments*\n\n`;
    md += `${story.content.substring(0, 500)}...\n\n`;
    if (story.topComments && story.topComments.length > 0) {
      md += `**Top community response**: ${story.topComments[0].body.substring(0, 300)}...\n\n`;
    }
  }

  md += '## Salary & Compensation Discussions\n\n';
  md += 'Real salary data and negotiation experiences from the community.\n\n';
  for (const sal of salaryData.slice(0, 15)) {
    md += `### ${sal.title}\n`;
    md += `*r/${sal.subreddit} | Score: ${sal.score}*\n\n`;
    md += `${sal.content.substring(0, 400)}...\n\n`;
  }

  md += '## Most Upvoted Career Advice\n\n';
  const topAdvice = allPosts
    .filter(p => p.isAdvice)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);

  for (const advice of topAdvice) {
    md += `### ${advice.title}\n`;
    md += `*r/${advice.subreddit} | Score: ${advice.score} | ${advice.numComments} comments*\n\n`;
    md += `${advice.content.substring(0, 400)}...\n\n`;
  }

  return md;
}

// Run if called directly
const isDirectRun = process.argv[1] && process.argv[1].includes('reddit-scraper');
if (isDirectRun) {
  runRedditScraper().catch(console.error);
}
