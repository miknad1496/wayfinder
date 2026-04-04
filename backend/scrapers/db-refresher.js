/**
 * Database Refresher Service
 *
 * Weekly refresh of curated databases:
 * - Manages deadlines (expiration, renewal)
 * - Performs data quality checks
 * - Generates statistics
 * - Flags entries for manual review
 *
 * This is NOT a traditional web scraper. These databases are curated,
 * so this service maintains data freshness and integrity locally.
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCRAPED_DIR = join(__dirname, '..', 'data', 'scraped');
const DATABASES = {
  internships: 'internships.json',
  scholarships: 'scholarships.json',
  programs: 'programs.json',
  'financial-aid': 'financial-aid-db.json'
};

// Thresholds for data quality checks
const THRESHOLDS = {
  MIN_DESCRIPTION_LENGTH: 50,
  FINANCIAL_AID_UPDATE_WINDOW_DAYS: 365
};

let report = {
  timestamp: new Date().toISOString(),
  databases: {},
  summary: {
    totalEntries: 0,
    totalExpired: 0,
    totalRenewed: 0,
    qualityIssuesFound: 0
  },
  errors: []
};

/**
 * Load a database JSON file
 */
async function loadDatabase(dbKey) {
  const filePath = join(SCRAPED_DIR, DATABASES[dbKey]);
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    throw new Error(`Failed to load ${dbKey}: ${err.message}`);
  }
}

/**
 * Save a database JSON file
 */
async function saveDatabase(dbKey, data) {
  const filePath = join(SCRAPED_DIR, DATABASES[dbKey]);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    throw new Error(`Failed to save ${dbKey}: ${err.message}`);
  }
}

/**
 * Check if a URL is valid and HTTPS
 */
function isValidUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Validate a deadline format (YYYY-MM-DD)
 */
function isValidDeadline(deadline) {
  if (!deadline) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(deadline)) return false;
  const date = new Date(deadline);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Check if a deadline has passed
 */
function isExpired(deadline) {
  if (!isValidDeadline(deadline)) return false;
  return new Date(deadline) < new Date();
}

/**
 * Auto-advance deadline by 1 year (for renewable programs)
 */
function renewDeadline(oldDeadline) {
  const date = new Date(oldDeadline);
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Process internships database
 */
async function processInternships() {
  const dbKey = 'internships';
  const dbReport = {
    name: 'Internships',
    totalEntries: 0,
    expired: [],
    renewed: [],
    qualityIssues: [],
    stats: {
      byCategory: {},
      avgDescriptionLength: 0,
      activeCount: 0,
      expiredCount: 0
    }
  };

  try {
    const db = await loadDatabase(dbKey);
    const entries = db.internships || [];
    dbReport.totalEntries = entries.length;

    let totalDescLength = 0;
    let activeCount = 0;
    let expiredCount = 0;
    const categoryCount = {};
    const qualityIssues = [];

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      // Deadline management
      if (entry.deadline) {
        if (isExpired(entry.deadline)) {
          if (!entry.expired) {
            entry.expired = true;
            dbReport.expired.push({
              index: i,
              company: entry.company,
              title: entry.title,
              deadline: entry.deadline
            });
            expiredCount++;
          } else {
            expiredCount++;
          }
        } else {
          activeCount++;
        }
      }

      // Renewable programs (e.g., 'summer' internships that repeat annually)
      if (entry.renewable && entry.deadline && isExpired(entry.deadline)) {
        const newDeadline = renewDeadline(entry.deadline);
        dbReport.renewed.push({
          index: i,
          company: entry.company,
          title: entry.title,
          oldDeadline: entry.deadline,
          newDeadline
        });
        entry.deadline = newDeadline;
        entry.expired = false;
        activeCount++;
        expiredCount--;
      }

      // Data quality checks
      const issues = [];

      if (!entry.title) issues.push('missing_title');
      if (!entry.company) issues.push('missing_company');
      if (!entry.deadline) issues.push('missing_deadline');
      if (!entry.description || entry.description.length < THRESHOLDS.MIN_DESCRIPTION_LENGTH) {
        issues.push('short_description');
      }
      if (entry.url && !isValidUrl(entry.url)) issues.push('invalid_url');
      if (!entry.field) issues.push('missing_field');

      if (issues.length > 0) {
        qualityIssues.push({
          index: i,
          company: entry.company || 'unknown',
          title: entry.title || 'unknown',
          issues
        });
      }

      // Statistics
      if (entry.field) {
        categoryCount[entry.field] = (categoryCount[entry.field] || 0) + 1;
      }

      if (entry.description) {
        totalDescLength += entry.description.length;
      }
    }

    // Save updated database
    await saveDatabase(dbKey, db);

    dbReport.qualityIssues = qualityIssues;
    dbReport.stats.byCategory = categoryCount;
    dbReport.stats.avgDescriptionLength = entries.length > 0
      ? Math.round(totalDescLength / entries.length)
      : 0;
    dbReport.stats.activeCount = activeCount;
    dbReport.stats.expiredCount = expiredCount;

    return dbReport;
  } catch (err) {
    report.errors.push({ database: dbKey, error: err.message });
    return dbReport;
  }
}

/**
 * Process scholarships database
 */
async function processScholarships() {
  const dbKey = 'scholarships';
  const dbReport = {
    name: 'Scholarships',
    totalEntries: 0,
    expired: [],
    renewed: [],
    qualityIssues: [],
    stats: {
      byCategory: {},
      avgDescriptionLength: 0,
      activeCount: 0,
      expiredCount: 0
    }
  };

  try {
    const db = await loadDatabase(dbKey);
    const entries = db.scholarships || [];
    dbReport.totalEntries = entries.length;

    let totalDescLength = 0;
    let activeCount = 0;
    let expiredCount = 0;
    const categoryCount = {};
    const qualityIssues = [];

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      // Deadline management
      if (entry.deadline) {
        if (isExpired(entry.deadline)) {
          if (!entry.expired) {
            entry.expired = true;
            dbReport.expired.push({
              index: i,
              name: entry.name,
              provider: entry.provider,
              deadline: entry.deadline
            });
            expiredCount++;
          } else {
            expiredCount++;
          }
        } else {
          activeCount++;
        }
      }

      // Renewable scholarships get deadline auto-advanced
      if (entry.renewable !== false && entry.deadline && isExpired(entry.deadline)) {
        const newDeadline = renewDeadline(entry.deadline);
        dbReport.renewed.push({
          index: i,
          name: entry.name,
          provider: entry.provider,
          oldDeadline: entry.deadline,
          newDeadline
        });
        entry.deadline = newDeadline;
        entry.expired = false;
        activeCount++;
        expiredCount--;
      }

      // Data quality checks
      const issues = [];

      if (!entry.name) issues.push('missing_name');
      if (!entry.provider) issues.push('missing_provider');
      if (!entry.deadline) issues.push('missing_deadline');
      if (entry.description && entry.description.length < THRESHOLDS.MIN_DESCRIPTION_LENGTH) {
        issues.push('short_description');
      }
      if (entry.url && !isValidUrl(entry.url)) issues.push('invalid_url');
      if (!entry.category || entry.category.length === 0) issues.push('missing_category');

      if (issues.length > 0) {
        qualityIssues.push({
          index: i,
          name: entry.name || 'unknown',
          provider: entry.provider || 'unknown',
          issues
        });
      }

      // Statistics
      if (entry.category && Array.isArray(entry.category)) {
        entry.category.forEach(cat => {
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
      }

      if (entry.description) {
        totalDescLength += entry.description.length;
      }
    }

    // Save updated database
    await saveDatabase(dbKey, db);

    dbReport.qualityIssues = qualityIssues;
    dbReport.stats.byCategory = categoryCount;
    dbReport.stats.avgDescriptionLength = entries.length > 0
      ? Math.round(totalDescLength / entries.length)
      : 0;
    dbReport.stats.activeCount = activeCount;
    dbReport.stats.expiredCount = expiredCount;

    return dbReport;
  } catch (err) {
    report.errors.push({ database: dbKey, error: err.message });
    return dbReport;
  }
}

/**
 * Process programs database
 */
async function processPrograms() {
  const dbKey = 'programs';
  const dbReport = {
    name: 'Programs',
    totalEntries: 0,
    expired: [],
    renewed: [],
    qualityIssues: [],
    stats: {
      byCategory: {},
      avgDescriptionLength: 0,
      activeCount: 0,
      expiredCount: 0
    }
  };

  try {
    const db = await loadDatabase(dbKey);
    const entries = db.programs || [];
    dbReport.totalEntries = entries.length;

    let totalDescLength = 0;
    let activeCount = 0;
    let expiredCount = 0;
    const categoryCount = {};
    const qualityIssues = [];

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      // Deadline management
      if (entry.deadline) {
        if (isExpired(entry.deadline)) {
          if (!entry.expired) {
            entry.expired = true;
            dbReport.expired.push({
              index: i,
              name: entry.name,
              provider: entry.provider,
              deadline: entry.deadline
            });
            expiredCount++;
          } else {
            expiredCount++;
          }
        } else {
          activeCount++;
        }
      }

      // Recurring programs get deadline auto-advanced
      if (entry.renewable !== false && entry.deadline && isExpired(entry.deadline)) {
        const newDeadline = renewDeadline(entry.deadline);
        dbReport.renewed.push({
          index: i,
          name: entry.name,
          provider: entry.provider,
          oldDeadline: entry.deadline,
          newDeadline
        });
        entry.deadline = newDeadline;
        entry.expired = false;
        activeCount++;
        expiredCount--;
      }

      // Data quality checks
      const issues = [];

      if (!entry.name) issues.push('missing_name');
      if (!entry.provider) issues.push('missing_provider');
      if (!entry.deadline) issues.push('missing_deadline');
      if (!entry.description || entry.description.length < THRESHOLDS.MIN_DESCRIPTION_LENGTH) {
        issues.push('short_description');
      }
      if (entry.url && !isValidUrl(entry.url)) issues.push('invalid_url');
      if (!entry.category) issues.push('missing_category');

      if (issues.length > 0) {
        qualityIssues.push({
          index: i,
          name: entry.name || 'unknown',
          provider: entry.provider || 'unknown',
          issues
        });
      }

      // Statistics
      if (entry.category) {
        categoryCount[entry.category] = (categoryCount[entry.category] || 0) + 1;
      }

      if (entry.description) {
        totalDescLength += entry.description.length;
      }
    }

    // Save updated database
    await saveDatabase(dbKey, db);

    dbReport.qualityIssues = qualityIssues;
    dbReport.stats.byCategory = categoryCount;
    dbReport.stats.avgDescriptionLength = entries.length > 0
      ? Math.round(totalDescLength / entries.length)
      : 0;
    dbReport.stats.activeCount = activeCount;
    dbReport.stats.expiredCount = expiredCount;

    return dbReport;
  } catch (err) {
    report.errors.push({ database: dbKey, error: err.message });
    return dbReport;
  }
}

/**
 * Process financial aid database
 */
async function processFinancialAid() {
  const dbKey = 'financial-aid';
  const dbReport = {
    name: 'Financial Aid',
    totalEntries: 0,
    expired: [],
    renewed: [],
    qualityIssues: [],
    outdatedPricing: [],
    stats: {
      byRegion: {},
      byType: {},
      needBlindCount: 0,
      meetsFullNeedCount: 0
    }
  };

  try {
    const db = await loadDatabase(dbKey);
    const entries = db.schools || [];
    dbReport.totalEntries = entries.length;

    const regionCount = {};
    const typeCount = {};
    let needBlindCount = 0;
    let meetsFullNeedCount = 0;
    const qualityIssues = [];
    const outdated = [];

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      // Check if pricing data is outdated (>365 days)
      if (entry.lastUpdated) {
        const lastUpdate = new Date(entry.lastUpdated);
        const daysSinceUpdate = Math.floor(
          (new Date() - lastUpdate) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceUpdate > THRESHOLDS.FINANCIAL_AID_UPDATE_WINDOW_DAYS) {
          outdated.push({
            index: i,
            school: entry.name,
            lastUpdated: entry.lastUpdated,
            daysSinceUpdate
          });
        }
      } else {
        // No lastUpdated field at all
        outdated.push({
          index: i,
          school: entry.name,
          lastUpdated: 'never',
          daysSinceUpdate: null
        });
      }

      // Data quality checks
      const issues = [];

      if (!entry.name) issues.push('missing_name');
      if (!entry.state) issues.push('missing_state');
      if (!entry.stickerPrice) issues.push('missing_sticker_price');
      if (!entry.netPriceByIncome) issues.push('missing_net_price_data');
      if (!entry.aidPolicies || entry.aidPolicies.length === 0) issues.push('missing_aid_policies');

      if (issues.length > 0) {
        qualityIssues.push({
          index: i,
          school: entry.name || 'unknown',
          issues
        });
      }

      // Statistics
      if (entry.region) {
        regionCount[entry.region] = (regionCount[entry.region] || 0) + 1;
      }

      if (entry.type) {
        typeCount[entry.type] = (typeCount[entry.type] || 0) + 1;
      }

      if (entry.needBlind) needBlindCount++;
      if (entry.meetsFullNeed) meetsFullNeedCount++;
    }

    dbReport.outdatedPricing = outdated;
    dbReport.qualityIssues = qualityIssues;
    dbReport.stats.byRegion = regionCount;
    dbReport.stats.byType = typeCount;
    dbReport.stats.needBlindCount = needBlindCount;
    dbReport.stats.meetsFullNeedCount = meetsFullNeedCount;

    // Don't save unless there are changes to make
    // (Financial aid data is less frequently updated)

    return dbReport;
  } catch (err) {
    report.errors.push({ database: dbKey, error: err.message });
    return dbReport;
  }
}

/**
 * Generate overall statistics file
 */
async function generateStatistics() {
  const stats = {
    refreshedAt: new Date().toISOString(),
    databases: {}
  };

  // Compile stats from each report
  for (const [key, dbReport] of Object.entries(report.databases)) {
    stats.databases[key] = {
      name: dbReport.name,
      totalEntries: dbReport.totalEntries,
      expirationStatus: {
        active: dbReport.stats.activeCount,
        expired: dbReport.stats.expiredCount
      },
      renewalActivity: {
        entriesRenewed: dbReport.renewed.length,
        entriesExpired: dbReport.expired.length
      },
      dataQuality: {
        issueCount: dbReport.qualityIssues.length,
        completeness: dbReport.totalEntries > 0
          ? Math.round(((dbReport.totalEntries - dbReport.qualityIssues.length) / dbReport.totalEntries) * 100)
          : 100
      }
    };

    if (key === 'financial-aid') {
      stats.databases[key].pricing = {
        outdatedCount: dbReport.outdatedPricing.length,
        needBlindSchools: dbReport.stats.needBlindCount,
        meetsFullNeedSchools: dbReport.stats.meetsFullNeedCount
      };
    } else {
      stats.databases[key].avgDescriptionLength = dbReport.stats.avgDescriptionLength;
      stats.databases[key].categories = dbReport.stats.byCategory;
    }
  }

  // Summary stats
  const allEntries = Object.values(report.databases).reduce((sum, db) => sum + db.totalEntries, 0);
  const allExpired = Object.values(report.databases).reduce((sum, db) => sum + db.expired.length, 0);
  const allRenewed = Object.values(report.databases).reduce((sum, db) => sum + db.renewed.length, 0);
  const allQualityIssues = Object.values(report.databases).reduce(
    (sum, db) => sum + db.qualityIssues.length, 0
  );

  stats.summary = {
    totalEntries: allEntries,
    totalExpiredThisRefresh: allExpired,
    totalRenewedThisRefresh: allRenewed,
    totalQualityIssuesDetected: allQualityIssues,
    overallCompletenessScore: allEntries > 0
      ? Math.round(((allEntries - allQualityIssues) / allEntries) * 100)
      : 100
  };

  // Save to file
  const statsFile = join(SCRAPED_DIR, 'db-stats.json');
  try {
    await fs.writeFile(statsFile, JSON.stringify(stats, null, 2));
    console.log('[DB Refresher] Statistics saved to db-stats.json');
  } catch (err) {
    console.error('[DB Refresher] Failed to save statistics:', err.message);
  }

  return stats;
}

/**
 * Log refresh report to console
 */
function logReport() {
  console.log('\n========================================');
  console.log('DATABASE REFRESH REPORT');
  console.log('========================================\n');

  for (const [key, dbReport] of Object.entries(report.databases)) {
    console.log(`${dbReport.name.toUpperCase()}`);
    console.log(`  Total entries: ${dbReport.totalEntries}`);
    console.log(`  Expired (flagged): ${dbReport.expired.length}`);
    console.log(`  Renewed (auto-advanced): ${dbReport.renewed.length}`);
    console.log(`  Quality issues: ${dbReport.qualityIssues.length}`);

    if (key === 'financial-aid' && dbReport.outdatedPricing.length > 0) {
      console.log(`  Pricing outdated (>365 days): ${dbReport.outdatedPricing.length}`);
    }

    console.log('');
  }

  if (report.errors.length > 0) {
    console.log('ERRORS:');
    report.errors.forEach(err => {
      console.log(`  [${err.database}] ${err.error}`);
    });
    console.log('');
  }

  console.log('SUMMARY:');
  console.log(`  Total entries processed: ${report.summary.totalEntries}`);
  console.log(`  Entries expired this refresh: ${report.summary.totalExpired}`);
  console.log(`  Entries renewed this refresh: ${report.summary.totalRenewed}`);
  console.log(`  Quality issues found: ${report.summary.qualityIssuesFound}`);
  console.log('\n========================================\n');
}

/**
 * Main refresh function
 */
export async function run() {
  console.log('[DB Refresher] Starting weekly database refresh...\n');

  // Reset report for this run (prevents accumulation across weekly runs)
  report = {
    timestamp: new Date().toISOString(),
    databases: {},
    summary: {
      totalEntries: 0,
      totalExpired: 0,
      totalRenewed: 0,
      qualityIssuesFound: 0
    },
    errors: []
  };

  // Process each database
  report.databases.internships = await processInternships();
  report.summary.totalEntries += report.databases.internships.totalEntries;
  report.summary.totalExpired += report.databases.internships.expired.length;
  report.summary.totalRenewed += report.databases.internships.renewed.length;
  report.summary.qualityIssuesFound += report.databases.internships.qualityIssues.length;

  report.databases.scholarships = await processScholarships();
  report.summary.totalEntries += report.databases.scholarships.totalEntries;
  report.summary.totalExpired += report.databases.scholarships.expired.length;
  report.summary.totalRenewed += report.databases.scholarships.renewed.length;
  report.summary.qualityIssuesFound += report.databases.scholarships.qualityIssues.length;

  report.databases.programs = await processPrograms();
  report.summary.totalEntries += report.databases.programs.totalEntries;
  report.summary.totalExpired += report.databases.programs.expired.length;
  report.summary.totalRenewed += report.databases.programs.renewed.length;
  report.summary.qualityIssuesFound += report.databases.programs.qualityIssues.length;

  report.databases['financial-aid'] = await processFinancialAid();
  report.summary.totalEntries += report.databases['financial-aid'].totalEntries;
  report.summary.qualityIssuesFound += report.databases['financial-aid'].qualityIssues.length;

  // Generate statistics
  await generateStatistics();

  // Log results
  logReport();

  console.log('[DB Refresher] Weekly database refresh completed successfully');
}

// Support running directly from command line
if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch(err => {
    console.error('[DB Refresher] Fatal error:', err);
    process.exit(1);
  });
}
