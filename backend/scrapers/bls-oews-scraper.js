/**
 * BLS OEWS (Occupational Employment and Wage Statistics) Scraper
 *
 * Replaces the broken bls-scraper.js which used Cheerio to scrape OOH pages
 * (CSS selectors broke, resulting in 191 occupations with ZERO salary data).
 *
 * This version downloads the official OEWS flat files (Excel) published annually
 * by BLS. These contain complete wage percentile data for 830+ occupations
 * across national, state, and metropolitan area levels.
 *
 * Data source: https://www.bls.gov/oes/tables.htm
 * Files: https://www.bls.gov/oes/special-requests/
 * License: Public domain (US government data)
 * Update frequency: Annual (May reference period, published ~March following year)
 *
 * Output: knowledge-base/bls-compensation.json
 * Schema: See KNOWLEDGE-BASE-ARCHITECTURE.md, Domain 1
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const KB_DIR = join(__dirname, '..', 'knowledge-base');

// ─── Configuration ────────────────────────────────────────────────

// OEWS flat file URLs (May 2024 = most recent as of March 2026)
// Format: oesm{YY}{level}.zip where YY=24, level=nat/st/ma
// Each zip contains one Excel file with all occupations for that geography level
const OEWS_YEAR = '24'; // 2-digit year for URL construction
const OEWS_REFERENCE = 'May 2024';

const OEWS_URLS = {
  national: `https://www.bls.gov/oes/special-requests/oesm${OEWS_YEAR}nat.zip`,
  state: `https://www.bls.gov/oes/special-requests/oesm${OEWS_YEAR}st.zip`,
  metro: `https://www.bls.gov/oes/special-requests/oesm${OEWS_YEAR}ma.zip`,
};

// ─── Target Occupations ───────────────────────────────────────────
// ~300 occupations that students, career changers, and parents actually ask about.
// Organized by the groups Wayfinder advises on most frequently.

const TARGET_SOC_CODES = new Set([
  // === COMPUTER & INFORMATION TECHNOLOGY ===
  '15-1211', // Computer Systems Analysts
  '15-1212', // Information Security Analysts
  '15-1221', // Computer and Information Research Scientists
  '15-1231', // Computer Network Support Specialists
  '15-1232', // Computer User Support Specialists
  '15-1241', // Computer Network Architects
  '15-1242', // Database Administrators
  '15-1243', // Database Architects
  '15-1244', // Network and Computer Systems Administrators
  '15-1245', // IT Project Managers (added 2024)
  '15-1251', // Computer Programmers
  '15-1252', // Software Developers
  '15-1253', // Software Quality Assurance Analysts and Testers
  '15-1254', // Web Developers
  '15-1255', // Web and Digital Interface Designers
  '15-1299', // Computer Occupations, All Other
  '15-2011', // Actuaries
  '15-2021', // Mathematicians
  '15-2031', // Operations Research Analysts
  '15-2041', // Statisticians
  '15-2051', // Data Scientists
  '15-2098', // Data Scientists and Mathematical Science Occupations, All Other

  // === ENGINEERING ===
  '17-1011', // Architects, Except Landscape and Naval
  '17-2011', // Aerospace Engineers
  '17-2021', // Agricultural Engineers
  '17-2031', // Bioengineers and Biomedical Engineers
  '17-2041', // Chemical Engineers
  '17-2051', // Civil Engineers
  '17-2061', // Computer Hardware Engineers
  '17-2071', // Electrical Engineers
  '17-2072', // Electronics Engineers, Except Computer
  '17-2081', // Environmental Engineers
  '17-2111', // Industrial Engineers
  '17-2112', // Industrial Engineers (Health and Safety)
  '17-2121', // Marine Engineers and Naval Architects
  '17-2131', // Materials Engineers
  '17-2141', // Mechanical Engineers
  '17-2151', // Mining and Geological Engineers
  '17-2161', // Nuclear Engineers
  '17-2171', // Petroleum Engineers
  '17-3011', // Architectural and Civil Drafters
  '17-3023', // Electrical and Electronics Engineering Technologists
  '17-3026', // Industrial Engineering Technologists and Technicians
  '17-3027', // Mechanical Engineering Technologists and Technicians

  // === HEALTHCARE ===
  '29-1011', // Chiropractors
  '29-1021', // Dentists, General
  '29-1031', // Dietitians and Nutritionists
  '29-1041', // Optometrists
  '29-1051', // Pharmacists
  '29-1071', // Physician Assistants
  '29-1122', // Occupational Therapists
  '29-1123', // Physical Therapists
  '29-1124', // Radiation Therapists
  '29-1125', // Recreational Therapists
  '29-1126', // Respiratory Therapists
  '29-1127', // Speech-Language Pathologists
  '29-1128', // Exercise Physiologists
  '29-1131', // Veterinarians
  '29-1141', // Registered Nurses
  '29-1151', // Nurse Anesthetists
  '29-1161', // Nurse Midwives
  '29-1171', // Nurse Practitioners
  '29-1181', // Audiologists
  '29-1211', // Anesthesiologists
  '29-1213', // Dermatologists
  '29-1214', // Emergency Medicine Physicians
  '29-1215', // Family Medicine Physicians
  '29-1216', // General Internal Medicine Physicians
  '29-1217', // Neurologists
  '29-1218', // Obstetricians and Gynecologists
  '29-1221', // Pediatricians, General
  '29-1223', // Psychiatrists
  '29-1224', // Radiologists
  '29-1228', // Physicians, All Other
  '29-1229', // Surgeons, All Other
  '29-1241', // Ophthalmologists, Except Pediatric
  '29-1242', // Orthopedic Surgeons, Except Pediatric
  '29-1243', // Pediatric Surgeons
  '29-1248', // Surgeons, All Other
  '29-1291', // Acupuncturists
  '29-1292', // Dental Hygienists
  '29-2010', // Clinical Laboratory Technologists and Technicians
  '29-2032', // Diagnostic Medical Sonographers
  '29-2033', // Nuclear Medicine Technologists
  '29-2034', // Radiologic Technologists and Technicians
  '29-2035', // Magnetic Resonance Imaging Technologists
  '29-2040', // Emergency Medical Technicians
  '29-2042', // Paramedics (if separate)
  '29-2052', // Pharmacy Technicians
  '29-2053', // Psychiatric Technicians
  '29-2055', // Surgical Technologists
  '29-2061', // Licensed Practical Nurses
  '29-2072', // Medical Records Specialists
  '29-2081', // Opticians, Dispensing
  '29-2091', // Orthotists and Prosthetists
  '29-9021', // Health Information Technologists

  // === BUSINESS & FINANCE ===
  '13-1011', // Agents and Business Managers
  '13-1023', // Purchasing Agents
  '13-1028', // Buyers and Purchasing Agents
  '13-1031', // Claims Adjusters
  '13-1041', // Compliance Officers
  '13-1051', // Cost Estimators
  '13-1071', // Human Resources Specialists
  '13-1074', // Farm Labor Contractors
  '13-1075', // Labor Relations Specialists
  '13-1081', // Logisticians
  '13-1082', // Project Management Specialists
  '13-1111', // Management Analysts
  '13-1121', // Meeting, Convention, and Event Planners
  '13-1131', // Fundraisers
  '13-1141', // Compensation, Benefits, and Job Analysis Specialists
  '13-1151', // Training and Development Specialists
  '13-1161', // Market Research Analysts and Marketing Specialists
  '13-2011', // Accountants and Auditors
  '13-2020', // Property Appraisers and Assessors
  '13-2031', // Budget Analysts
  '13-2041', // Credit Analysts
  '13-2051', // Financial and Investment Analysts
  '13-2052', // Personal Financial Advisors
  '13-2053', // Insurance Underwriters
  '13-2054', // Financial Risk Specialists
  '13-2061', // Financial Examiners
  '13-2072', // Loan Officers
  '13-2082', // Tax Preparers

  // === MANAGEMENT ===
  '11-1011', // Chief Executives
  '11-1021', // General and Operations Managers
  '11-1031', // Legislators
  '11-2011', // Advertising and Promotions Managers
  '11-2021', // Marketing Managers
  '11-2022', // Sales Managers
  '11-2031', // Public Relations and Fundraising Managers
  '11-3011', // Administrative Services Managers
  '11-3013', // Facilities Managers
  '11-3021', // Computer and Information Systems Managers
  '11-3031', // Financial Managers
  '11-3051', // Industrial Production Managers
  '11-3061', // Purchasing Managers
  '11-3071', // Transportation, Storage, and Distribution Managers
  '11-3111', // Compensation and Benefits Managers
  '11-3121', // Human Resources Managers
  '11-3131', // Training and Development Managers
  '11-9013', // Farmers, Ranchers, Agricultural Managers
  '11-9021', // Construction Managers
  '11-9031', // Education and Childcare Administrators, Preschool/Daycare
  '11-9032', // Education Administrators, Kindergarten through Secondary
  '11-9033', // Education Administrators, Postsecondary
  '11-9041', // Architectural and Engineering Managers
  '11-9051', // Food Service Managers
  '11-9071', // Gambling Managers
  '11-9081', // Lodging Managers
  '11-9111', // Medical and Health Services Managers
  '11-9121', // Natural Sciences Managers
  '11-9151', // Social and Community Service Managers
  '11-9161', // Emergency Management Directors
  '11-9198', // Personal Service Managers, All Other

  // === EDUCATION ===
  '25-1011', // Business Teachers, Postsecondary
  '25-1021', // Computer Science Teachers, Postsecondary
  '25-1022', // Mathematical Science Teachers, Postsecondary
  '25-1032', // Engineering Teachers, Postsecondary
  '25-1042', // Biological Science Teachers, Postsecondary
  '25-1052', // Chemistry Teachers, Postsecondary
  '25-1054', // Physics Teachers, Postsecondary
  '25-1063', // Economics Teachers, Postsecondary
  '25-1066', // Psychology Teachers, Postsecondary
  '25-2011', // Preschool Teachers, Except Special Education
  '25-2012', // Kindergarten Teachers
  '25-2021', // Elementary School Teachers
  '25-2022', // Middle School Teachers
  '25-2031', // Secondary School Teachers
  '25-2032', // Special Education Teachers, K-12
  '25-2054', // Special Education Teachers, Secondary School
  '25-2059', // Special Education Teachers, All Other
  '25-3011', // Adult Basic Education Teachers
  '25-3021', // Self-Enrichment Teachers
  '25-3031', // Substitute Teachers
  '25-4013', // Museum Technicians and Conservators
  '25-4022', // Librarians and Media Collections Specialists
  '25-9031', // Instructional Designers and Technologists
  '25-9042', // Teaching Assistants, Postsecondary

  // === LEGAL ===
  '23-1011', // Lawyers
  '23-1012', // Judicial Law Clerks
  '23-1021', // Administrative Law Judges
  '23-1022', // Arbitrators, Mediators, and Conciliators
  '23-1023', // Judges, Magistrate Judges
  '23-2011', // Paralegals and Legal Assistants
  '23-2093', // Title Examiners, Abstractors, Searchers

  // === ARTS, DESIGN, MEDIA ===
  '27-1011', // Art Directors
  '27-1013', // Fine Artists, Including Painters, Sculptors
  '27-1014', // Special Effects Artists and Animators
  '27-1021', // Commercial and Industrial Designers
  '27-1022', // Fashion Designers
  '27-1024', // Graphic Designers
  '27-1025', // Interior Designers
  '27-1027', // Set and Exhibit Designers
  '27-2011', // Actors
  '27-2012', // Producers and Directors
  '27-2022', // Coaches and Scouts
  '27-2032', // Choreographers
  '27-2041', // Music Directors and Composers
  '27-2042', // Musicians and Singers
  '27-3011', // Broadcast Announcers and Radio DJs
  '27-3023', // News Analysts, Reporters, Journalists
  '27-3031', // Public Relations Specialists
  '27-3041', // Editors
  '27-3042', // Technical Writers
  '27-3043', // Writers and Authors
  '27-3091', // Interpreters and Translators
  '27-4011', // Audio and Video Technicians
  '27-4021', // Photographers
  '27-4031', // Camera Operators, Television, Video, Motion Picture
  '27-4032', // Film and Video Editors

  // === TRADES & CONSTRUCTION (high demand, AI-resistant) ===
  '47-1011', // First-Line Supervisors of Construction Trades
  '47-2011', // Boilermakers
  '47-2021', // Brickmasons and Blockmasons
  '47-2031', // Carpenters
  '47-2041', // Carpet Installers
  '47-2044', // Tile and Stone Setters
  '47-2051', // Cement Masons and Concrete Finishers
  '47-2061', // Construction Laborers
  '47-2071', // Paving, Surfacing, Tamping Operators
  '47-2073', // Operating Engineers, Construction Equipment
  '47-2081', // Drywall and Ceiling Tile Installers
  '47-2111', // Electricians
  '47-2121', // Glaziers
  '47-2130', // Insulation Workers
  '47-2141', // Painters, Construction and Maintenance
  '47-2151', // Pipelayers
  '47-2152', // Plumbers, Pipefitters, and Steamfitters
  '47-2181', // Roofers
  '47-2211', // Sheet Metal Workers
  '47-2221', // Structural Iron and Steel Workers
  '47-4011', // Construction and Building Inspectors

  // === INSTALLATION, MAINTENANCE, REPAIR ===
  '49-1011', // First-Line Supervisors of Mechanics/Installers/Repairers
  '49-2011', // Computer/ATM/Office Machine Repairers
  '49-2022', // Telecommunications Equipment Installers
  '49-2098', // Security and Fire Alarm Systems Installers
  '49-3011', // Aircraft Mechanics and Service Technicians
  '49-3021', // Automotive Body and Related Repairers
  '49-3023', // Automotive Service Technicians and Mechanics
  '49-3031', // Bus and Truck Mechanics and Diesel Engine Specialists
  '49-3042', // Mobile Heavy Equipment Mechanics
  '49-3053', // Outdoor Power Equipment Mechanics
  '49-9021', // Heating/AC/Refrigeration Mechanics (HVAC)
  '49-9041', // Industrial Machinery Mechanics
  '49-9044', // Millwrights
  '49-9051', // Electrical Power-Line Installers and Repairers
  '49-9052', // Telecommunications Line Installers and Repairers
  '49-9071', // Maintenance and Repair Workers, General

  // === PROTECTIVE SERVICES ===
  '33-1012', // First-Line Supervisors of Police
  '33-2011', // Firefighters
  '33-3012', // Correctional Officers and Jailers
  '33-3021', // Detectives and Criminal Investigators
  '33-3051', // Police and Sheriff Patrol Officers
  '33-9032', // Security Guards

  // === COMMUNITY & SOCIAL SERVICES ===
  '21-1011', // Substance Abuse/Mental Health Counselors
  '21-1012', // Educational, Guidance, Vocational Counselors
  '21-1013', // Marriage and Family Therapists
  '21-1014', // Mental Health Counselors
  '21-1015', // Rehabilitation Counselors
  '21-1018', // Substance Abuse Counselors
  '21-1019', // Counselors, All Other
  '21-1021', // Child, Family, and School Social Workers
  '21-1022', // Healthcare Social Workers
  '21-1023', // Mental Health and Substance Abuse Social Workers
  '21-1029', // Social Workers, All Other
  '21-1091', // Health Education Specialists
  '21-1092', // Probation Officers and Correctional Treatment Specialists
  '21-1093', // Social and Human Service Assistants

  // === SCIENCE ===
  '19-1011', // Animal Scientists
  '19-1012', // Food Scientists and Technologists
  '19-1013', // Soil and Plant Scientists
  '19-1021', // Biochemists and Biophysicists
  '19-1022', // Microbiologists
  '19-1029', // Biological Scientists, All Other
  '19-1031', // Conservation Scientists
  '19-1032', // Foresters
  '19-1041', // Epidemiologists
  '19-1042', // Medical Scientists
  '19-2011', // Astronomers
  '19-2012', // Physicists
  '19-2021', // Atmospheric and Space Scientists
  '19-2031', // Chemists
  '19-2032', // Materials Scientists
  '19-2041', // Environmental Scientists
  '19-2042', // Geoscientists
  '19-2043', // Hydrologists
  '19-3011', // Economists
  '19-3022', // Survey Researchers
  '19-3032', // Industrial-Organizational Psychologists
  '19-3033', // Clinical and Counseling Psychologists
  '19-3034', // School Psychologists
  '19-4012', // Agricultural Technicians
  '19-4021', // Biological Technicians
  '19-4031', // Chemical Technicians
  '19-4042', // Environmental Science Technicians
  '19-4099', // Life, Physical, Social Science Technicians, All Other

  // === SALES ===
  '41-1012', // First-Line Supervisors of Sales Workers
  '41-2011', // Cashiers
  '41-2031', // Retail Salespersons
  '41-3011', // Advertising Sales Agents
  '41-3021', // Insurance Sales Agents
  '41-3031', // Securities, Commodities, Financial Services Sales
  '41-3041', // Travel Agents
  '41-4012', // Sales Reps, Wholesale/Manufacturing (Technical)
  '41-9022', // Real Estate Sales Agents
  '41-9031', // Sales Engineers

  // === TRANSPORTATION ===
  '53-1042', // First-Line Supervisors of Helpers, Laborers, Material Movers
  '53-2011', // Airline Pilots, Copilots, Flight Engineers
  '53-2012', // Commercial Pilots
  '53-2031', // Flight Attendants
  '53-3032', // Heavy and Tractor-Trailer Truck Drivers
  '53-3033', // Light Truck Drivers
  '53-3052', // Bus Drivers, Transit and Intercity
  '53-4011', // Locomotive Engineers
  '53-5021', // Captains, Mates, Pilots of Water Vessels
  '53-6051', // Transportation Inspectors
  '53-7062', // Laborers and Material Movers

  // === FOOD PREPARATION & SERVICE ===
  '35-1012', // First-Line Supervisors of Food Prep/Service
  '35-2014', // Cooks, Restaurant
  '35-2015', // Cooks, Short Order
  '35-2019', // Cooks, All Other
  '35-2021', // Food Preparation Workers
  '35-3023', // Fast Food and Counter Workers
  '35-3031', // Waiters and Waitresses

  // === OFFICE & ADMINISTRATIVE ===
  '43-1011', // First-Line Supervisors of Office Workers
  '43-3031', // Bookkeeping, Accounting, and Auditing Clerks
  '43-4051', // Customer Service Representatives
  '43-4171', // Receptionists and Information Clerks
  '43-6011', // Executive Secretaries and Executive Administrative Assistants
  '43-6014', // Secretaries and Administrative Assistants
  '43-9061', // Office Clerks, General

  // === MILITARY-ADJACENT (civilian equivalents) ===
  '55-1011', // Air Crew Officers
  '55-1012', // Aircraft Launch/Recovery Officers
  '55-1013', // Armored Assault Vehicle Officers
  '55-1014', // Artillery and Missile Officers
  '55-1015', // Command and Control Center Officers
  '55-1016', // Infantry Officers
  '55-1017', // Special Forces Officers
  '55-3011', // Air Crew Members
  '55-3013', // Armored Assault Vehicle Crew Members
  '55-3014', // Artillery and Missile Crew Members
]);

// Top 50 metro areas by population (where students/career changers actually live)
const TARGET_METROS = new Set([
  'New York-Newark-Jersey City, NY-NJ-PA',
  'Los Angeles-Long Beach-Anaheim, CA',
  'Chicago-Naperville-Elgin, IL-IN-WI',
  'Dallas-Fort Worth-Arlington, TX',
  'Houston-The Woodlands-Sugar Land, TX',
  'Washington-Arlington-Alexandria, DC-VA-MD-WV',
  'Philadelphia-Camden-Wilmington, PA-NJ-DE-MD',
  'Miami-Fort Lauderdale-Pompano Beach, FL',
  'Atlanta-Sandy Springs-Alpharetta, GA',
  'Boston-Cambridge-Nashua, MA-NH',
  'Phoenix-Mesa-Chandler, AZ',
  'San Francisco-Oakland-Berkeley, CA',
  'Riverside-San Bernardino-Ontario, CA',
  'Detroit-Warren-Dearborn, MI',
  'Seattle-Tacoma-Bellevue, WA',
  'Minneapolis-St. Paul-Bloomington, MN-WI',
  'San Diego-Chula Vista-Carlsbad, CA',
  'Tampa-St. Petersburg-Clearwater, FL',
  'Denver-Aurora-Lakewood, CO',
  'St. Louis, MO-IL',
  'Baltimore-Columbia-Towson, MD',
  'Charlotte-Concord-Gastonia, NC-SC',
  'Orlando-Kissimmee-Sanford, FL',
  'San Antonio-New Braunfels, TX',
  'Portland-Vancouver-Hillsboro, OR-WA',
  'Sacramento-Roseville-Folsom, CA',
  'Pittsburgh, PA',
  'Austin-Round Rock-Georgetown, TX',
  'Las Vegas-Henderson-Paradise, NV',
  'Cincinnati, OH-KY-IN',
  'Kansas City, MO-KS',
  'Columbus, OH',
  'Indianapolis-Carmel-Anderson, IN',
  'Cleveland-Elyria, OH',
  'San Jose-Sunnyvale-Santa Clara, CA',
  'Nashville-Davidson--Murfreesboro--Franklin, TN',
  'Virginia Beach-Norfolk-Newport News, VA-NC',
  'Providence-Warwick, RI-MA',
  'Milwaukee-Waukesha, WI',
  'Jacksonville, FL',
  'Memphis, TN-MS-AR',
  'Oklahoma City, OK',
  'Raleigh-Cary, NC',
  'Louisville/Jefferson County, KY-IN',
  'Richmond, VA',
  'New Orleans-Metairie, LA',
  'Hartford-East Hartford-Middletown, CT',
  'Salt Lake City, UT',
  'Birmingham-Hoover, AL',
  'Buffalo-Cheektowaga, NY',
]);

// ─── OEWS Excel File Parsing ──────────────────────────────────────

/**
 * Parse OEWS Excel data into our schema format.
 *
 * OEWS Excel columns (2024 format):
 * - AREA_TITLE: Geography name (e.g., "U.S.", "California", "New York-Newark...")
 * - AREA_TYPE: 1=National, 2=State, 3=Metropolitan, 4=Nonmetropolitan
 * - PRIM_STATE: Primary state code
 * - NAICS_TITLE: Industry name (cross-industry = "Cross-industry, Private, Federal, State, and Local Government")
 * - OCC_CODE: SOC code (e.g., "15-1252")
 * - OCC_TITLE: Occupation title
 * - O_GROUP: "detailed", "broad", "major", "total"
 * - TOT_EMP: Total employment (number or "**" for suppressed)
 * - EMP_PRSE: Employment percent relative standard error
 * - H_MEAN: Hourly mean wage
 * - A_MEAN: Annual mean wage
 * - MEAN_PRSE: Mean wage percent relative standard error
 * - H_PCT10, H_PCT25, H_MEDIAN, H_PCT75, H_PCT90: Hourly percentiles
 * - A_PCT10, A_PCT25, A_MEDIAN, A_PCT75, A_PCT90: Annual percentiles
 * - JOBS_1000: Employment per 1,000 jobs
 * - LOC_QUOTIENT: Location quotient
 *
 * Values may be "*" (wage estimate not available), "**" (employment suppressed),
 * "#" (>=$115.00/hr or >=$239,200/yr)
 */

function parseWage(value) {
  if (!value || value === '*' || value === '**' || value === '***' || value === '-') return null;
  if (value === '#') return 239200; // BLS caps at $239,200/yr or $115/hr — use the annual cap
  const cleaned = String(value).replace(/[,$]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseEmployment(value) {
  if (!value || value === '**' || value === '*') return null;
  const cleaned = String(value).replace(/[,]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

/**
 * Process the national-level OEWS data file.
 * Returns a Map<soc_code, occupation_data>
 */
function processNationalData(rows) {
  const occupations = new Map();

  for (const row of rows) {
    const soc = row.OCC_CODE || row.occ_code;
    if (!soc || !TARGET_SOC_CODES.has(soc)) continue;

    // Only "detailed" occupation groups (not broad/major/total rollups)
    const group = (row.O_GROUP || row.o_group || '').toLowerCase();
    if (group !== 'detailed') continue;

    // Only cross-industry totals (not industry-specific breakdowns)
    const naics = row.NAICS || row.naics || row.NAICS_TITLE || '';
    if (naics && !String(naics).includes('000000') && !String(naics).includes('Cross-industry') && String(naics) !== '000000') {
      // Skip industry-specific rows — we want the all-industries total
      // But check the NAICS code column if available
      const naicsCode = row.NAICS || row.naics || row.I_GROUP || '';
      if (String(naicsCode) !== '000000' && String(naicsCode) !== 'cross-industry') continue;
    }

    const title = row.OCC_TITLE || row.occ_title || '';

    occupations.set(soc, {
      soc,
      title: title.replace(/\s+/g, ' ').trim(),
      wages: {
        national: {
          annual: {
            p10: parseWage(row.A_PCT10 || row.a_pct10),
            p25: parseWage(row.A_PCT25 || row.a_pct25),
            p50: parseWage(row.A_MEDIAN || row.a_median),
            p75: parseWage(row.A_PCT75 || row.a_pct75),
            p90: parseWage(row.A_PCT90 || row.a_pct90),
            mean: parseWage(row.A_MEAN || row.a_mean),
          },
          hourly: {
            p10: parseWage(row.H_PCT10 || row.h_pct10),
            p25: parseWage(row.H_PCT25 || row.h_pct25),
            p50: parseWage(row.H_MEDIAN || row.h_median),
            p75: parseWage(row.H_PCT75 || row.h_pct75),
            p90: parseWage(row.H_PCT90 || row.h_pct90),
            mean: parseWage(row.H_MEAN || row.h_mean),
          },
        },
        by_state: {},
        by_metro: {},
      },
      employment: {
        total: parseEmployment(row.TOT_EMP || row.tot_emp),
        jobs_per_1000: parseWage(row.JOBS_1000 || row.jobs_1000),
      },
      reference_period: OEWS_REFERENCE,
      source: 'BLS OEWS',
    });
  }

  return occupations;
}

/**
 * Process state-level OEWS data and merge into national occupation map.
 */
function processStateData(rows, occupations) {
  for (const row of rows) {
    const soc = row.OCC_CODE || row.occ_code;
    if (!soc || !occupations.has(soc)) continue;

    const group = (row.O_GROUP || row.o_group || '').toLowerCase();
    if (group !== 'detailed') continue;

    const stateCode = row.PRIM_STATE || row.prim_state || row.ST || row.st;
    if (!stateCode) continue;

    // Skip if it's a nonmetro or metro row that leaked into state file
    const areaType = String(row.AREA_TYPE || row.area_type || '');
    if (areaType && areaType !== '2') continue; // 2 = state level

    const occ = occupations.get(soc);
    const median = parseWage(row.A_MEDIAN || row.a_median);
    const employment = parseEmployment(row.TOT_EMP || row.tot_emp);

    if (median || employment) {
      occ.wages.by_state[stateCode] = {
        annual: {
          p10: parseWage(row.A_PCT10 || row.a_pct10),
          p25: parseWage(row.A_PCT25 || row.a_pct25),
          p50: median,
          p75: parseWage(row.A_PCT75 || row.a_pct75),
          p90: parseWage(row.A_PCT90 || row.a_pct90),
        },
        employment: employment,
      };
    }
  }
}

/**
 * Process metro-level OEWS data and merge into national occupation map.
 */
function processMetroData(rows, occupations) {
  for (const row of rows) {
    const soc = row.OCC_CODE || row.occ_code;
    if (!soc || !occupations.has(soc)) continue;

    const group = (row.O_GROUP || row.o_group || '').toLowerCase();
    if (group !== 'detailed') continue;

    const areaTitle = (row.AREA_TITLE || row.area_title || '').trim();
    if (!areaTitle) continue;

    // Only include target metros
    if (!TARGET_METROS.has(areaTitle)) continue;

    const occ = occupations.get(soc);
    const median = parseWage(row.A_MEDIAN || row.a_median);
    const employment = parseEmployment(row.TOT_EMP || row.tot_emp);

    if (median || employment) {
      occ.wages.by_metro[areaTitle] = {
        annual: {
          p10: parseWage(row.A_PCT10 || row.a_pct10),
          p25: parseWage(row.A_PCT25 || row.a_pct25),
          p50: median,
          p75: parseWage(row.A_PCT75 || row.a_pct75),
          p90: parseWage(row.A_PCT90 || row.a_pct90),
        },
        employment: employment,
      };
    }
  }
}

// ─── OOH Outlook Data ─────────────────────────────────────────────
// Employment projections come from BLS Employment Projections program
// Available at: https://data.bls.gov/projections/occupationProj
// For now, we'll add these as a separate enrichment step

const KNOWN_OUTLOOKS = {
  '15-1252': { growth_rate: '17%', growth_category: 'Much faster than average', projected_openings: 140100, period: '2024-2034' },
  '15-1212': { growth_rate: '33%', growth_category: 'Much faster than average', projected_openings: 17300, period: '2024-2034' },
  '15-2051': { growth_rate: '36%', growth_category: 'Much faster than average', projected_openings: 20800, period: '2024-2034' },
  '29-1141': { growth_rate: '6%', growth_category: 'Faster than average', projected_openings: 193100, period: '2024-2034' },
  '29-1171': { growth_rate: '40%', growth_category: 'Much faster than average', projected_openings: 29400, period: '2024-2034' },
  '29-1071': { growth_rate: '28%', growth_category: 'Much faster than average', projected_openings: 12700, period: '2024-2034' },
  '47-2111': { growth_rate: '11%', growth_category: 'Much faster than average', projected_openings: 73500, period: '2024-2034' },
  '47-2152': { growth_rate: '6%', growth_category: 'Faster than average', projected_openings: 42600, period: '2024-2034' },
  '49-9021': { growth_rate: '9%', growth_category: 'Much faster than average', projected_openings: 37700, period: '2024-2034' },
  '13-2011': { growth_rate: '6%', growth_category: 'Faster than average', projected_openings: 126500, period: '2024-2034' },
  '11-3021': { growth_rate: '17%', growth_category: 'Much faster than average', projected_openings: 48500, period: '2024-2034' },
  '23-1011': { growth_rate: '8%', growth_category: 'Faster than average', projected_openings: 39800, period: '2024-2034' },
  // More will be added as we get the full projections data
};

// ─── Main Runner ──────────────────────────────────────────────────

/**
 * Main scraper function.
 *
 * USAGE:
 *
 * Option 1 — Download flat files manually first (recommended for initial load):
 *   1. Download these files from https://www.bls.gov/oes/tables.htm:
 *      - National: oesm24nat.zip → extract to data/oews/national_M2024_dl.xlsx
 *      - State: oesm24st.zip → extract to data/oews/state_M2024_dl.xlsx
 *      - Metro: oesm24ma.zip → extract to data/oews/MSA_M2024_dl.xlsx
 *   2. Run: node bls-oews-scraper.js --from-files ./data/oews/
 *
 * Option 2 — Auto-download (requires internet access):
 *   Run: node bls-oews-scraper.js --download
 *   (Downloads ~15MB of zip files from BLS, extracts, processes)
 */
export async function runBLSOEWSScraper(options = {}) {
  console.log('\n=== BLS OEWS Compensation Scraper ===');
  console.log(`Target: ${TARGET_SOC_CODES.size} occupations × 50 states × ${TARGET_METROS.size} metros\n`);

  let nationalRows, stateRows, metroRows;

  if (options.fromFiles) {
    // Load from pre-downloaded Excel files
    console.log(`Loading data from ${options.fromFiles}...`);
    const XLSX = (await import('xlsx')).default;

    const natFile = await findFile(options.fromFiles, ['national', 'nat', 'oesm']);
    const stFile = await findFile(options.fromFiles, ['state', '_st', 'st_']);
    const maFile = await findFile(options.fromFiles, ['MSA', 'metro', '_ma', 'ma_']);

    if (natFile) {
      console.log(`  National: ${natFile}`);
      const wb = XLSX.readFile(natFile);
      nationalRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      console.log(`    → ${nationalRows.length} rows`);
    }

    if (stFile) {
      console.log(`  State: ${stFile}`);
      const wb = XLSX.readFile(stFile);
      stateRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      console.log(`    → ${stateRows.length} rows`);
    }

    if (maFile) {
      console.log(`  Metro: ${maFile}`);
      const wb = XLSX.readFile(maFile);
      metroRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      console.log(`    → ${metroRows.length} rows`);
    }
  } else if (options.download) {
    // Auto-download from BLS
    console.log('Downloading OEWS flat files from BLS...');
    const tmpDir = join(__dirname, '..', 'data', 'oews');
    await fs.mkdir(tmpDir, { recursive: true });

    for (const [level, url] of Object.entries(OEWS_URLS)) {
      console.log(`  Downloading ${level}: ${url}`);
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const zipPath = join(tmpDir, `oews_${level}.zip`);
        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.writeFile(zipPath, buffer);
        console.log(`    → Saved ${(buffer.length / 1024 / 1024).toFixed(1)}MB`);

        // Extract zip
        const AdmZip = (await import('adm-zip')).default;
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(tmpDir, true);
        console.log(`    → Extracted`);
      } catch (err) {
        console.error(`    ✗ Failed to download ${level}: ${err.message}`);
        console.error(`      Download manually from: ${url}`);
      }
    }

    // Now load the extracted files
    return runBLSOEWSScraper({ fromFiles: tmpDir });
  } else {
    console.log('ERROR: Specify --from-files <dir> or --download');
    console.log('');
    console.log('For initial load, download OEWS Excel files from:');
    console.log('  https://www.bls.gov/oes/tables.htm');
    console.log('');
    console.log('Download and extract:');
    console.log(`  National: ${OEWS_URLS.national}`);
    console.log(`  State:    ${OEWS_URLS.state}`);
    console.log(`  Metro:    ${OEWS_URLS.metro}`);
    console.log('');
    console.log('Then run:');
    console.log('  node bls-oews-scraper.js --from-files <extracted-dir>');
    return null;
  }

  // ─── Process Data ─────────────────────────────────────────────

  console.log('\nProcessing occupation data...');

  // Step 1: Build national occupation map
  let occupations;
  if (nationalRows) {
    occupations = processNationalData(nationalRows);
    console.log(`  National: ${occupations.size} target occupations found`);
  } else {
    console.error('  ✗ No national data loaded');
    occupations = new Map();
  }

  // Step 2: Merge state data
  if (stateRows && occupations.size > 0) {
    processStateData(stateRows, occupations);
    const stateCount = [...occupations.values()].filter(o => Object.keys(o.wages.by_state).length > 0).length;
    console.log(`  State: ${stateCount} occupations have state-level wage data`);
  }

  // Step 3: Merge metro data
  if (metroRows && occupations.size > 0) {
    processMetroData(metroRows, occupations);
    const metroCount = [...occupations.values()].filter(o => Object.keys(o.wages.by_metro).length > 0).length;
    console.log(`  Metro: ${metroCount} occupations have metro-level wage data`);
  }

  // Step 4: Add outlook data where available
  for (const [soc, outlook] of Object.entries(KNOWN_OUTLOOKS)) {
    if (occupations.has(soc)) {
      occupations.get(soc).outlook = outlook;
    }
  }

  // ─── Output ───────────────────────────────────────────────────

  const result = [...occupations.values()];

  // Sort by SOC code
  result.sort((a, b) => a.soc.localeCompare(b.soc));

  // Stats
  const withNationalWages = result.filter(o => o.wages.national.annual.p50 !== null);
  const withStateData = result.filter(o => Object.keys(o.wages.by_state).length > 0);
  const withMetroData = result.filter(o => Object.keys(o.wages.by_metro).length > 0);
  const totalStateEntries = result.reduce((sum, o) => sum + Object.keys(o.wages.by_state).length, 0);
  const totalMetroEntries = result.reduce((sum, o) => sum + Object.keys(o.wages.by_metro).length, 0);

  console.log('\n─── Results Summary ───');
  console.log(`Total occupations:      ${result.length}`);
  console.log(`With national wages:    ${withNationalWages.length}`);
  console.log(`With state breakdown:   ${withStateData.length} occupations, ${totalStateEntries} state entries`);
  console.log(`With metro breakdown:   ${withMetroData.length} occupations, ${totalMetroEntries} metro entries`);
  console.log(`With outlook data:      ${result.filter(o => o.outlook).length}`);
  console.log(`Total data points:      ~${result.length + totalStateEntries + totalMetroEntries}`);

  // Save
  const outPath = join(KB_DIR, 'bls-compensation.json');
  await fs.writeFile(outPath, JSON.stringify(result, null, 2));
  console.log(`\nSaved: ${outPath}`);
  console.log(`File size: ${((await fs.stat(outPath)).size / 1024 / 1024).toFixed(1)}MB`);

  // Validation warnings
  if (withNationalWages.length < 200) {
    console.warn(`\n⚠ Only ${withNationalWages.length} occupations have national wage data. Expected 250+.`);
    console.warn('  Check that SOC codes in TARGET_SOC_CODES match the OEWS file format.');
  }

  // Sample output for verification
  console.log('\n─── Sample Output (first 3 occupations) ───');
  for (const occ of result.slice(0, 3)) {
    const nat = occ.wages.national.annual;
    console.log(`  ${occ.soc} ${occ.title}`);
    console.log(`    National median: $${nat.p50?.toLocaleString() || 'N/A'}`);
    console.log(`    Range: $${nat.p10?.toLocaleString() || '?'} - $${nat.p90?.toLocaleString() || '?'}`);
    console.log(`    States: ${Object.keys(occ.wages.by_state).length}, Metros: ${Object.keys(occ.wages.by_metro).length}`);
  }

  return result;
}

/**
 * Find a file in a directory matching one of the given patterns.
 */
async function findFile(dir, patterns) {
  try {
    // Collect all xlsx/xls/csv files, including in immediate subdirectories
    const allFiles = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && (entry.name.endsWith('.xlsx') || entry.name.endsWith('.xls') || entry.name.endsWith('.csv'))) {
        allFiles.push({ name: entry.name, path: join(dir, entry.name) });
      } else if (entry.isDirectory()) {
        try {
          const subEntries = await fs.readdir(join(dir, entry.name));
          for (const sub of subEntries) {
            if (sub.endsWith('.xlsx') || sub.endsWith('.xls') || sub.endsWith('.csv')) {
              allFiles.push({ name: sub, path: join(dir, entry.name, sub) });
            }
          }
        } catch { /* skip unreadable subdirs */ }
      }
    }

    for (const pattern of patterns) {
      const match = allFiles.find(f => f.name.toLowerCase().includes(pattern.toLowerCase()));
      if (match) return match.path;
    }
    // If no pattern match, try any Excel file
    if (allFiles.length > 0) return allFiles[0].path;
  } catch (err) {
    console.warn(`  Warning: Could not read directory ${dir}: ${err.message}`);
  }
  return null;
}

// ─── CLI ──────────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (args.includes('--from-files')) {
  const dirIdx = args.indexOf('--from-files');
  const dir = args[dirIdx + 1] || './data/oews';
  runBLSOEWSScraper({ fromFiles: dir }).catch(console.error);
} else if (args.includes('--download')) {
  runBLSOEWSScraper({ download: true }).catch(console.error);
} else if (args.includes('--help') || args.length === 0) {
  console.log(`
BLS OEWS Compensation Scraper
==============================

Downloads and processes Bureau of Labor Statistics occupation wage data
with full percentile breakdowns by geography.

Usage:
  node bls-oews-scraper.js --from-files <dir>   Process pre-downloaded OEWS Excel files
  node bls-oews-scraper.js --download            Auto-download from BLS (requires internet)
  node bls-oews-scraper.js --help                Show this help

Setup (first time):
  1. Go to https://www.bls.gov/oes/tables.htm
  2. Under "Downloads", get the May 2024 data:
     - National: "All data" (oesm24nat.zip)
     - State:    "All data" (oesm24st.zip)
     - Metro:    "All data" (oesm24ma.zip)
  3. Extract the .xlsx files into a directory
  4. Run: node bls-oews-scraper.js --from-files <that-directory>

Dependencies:
  npm install xlsx adm-zip

Output:
  knowledge-base/bls-compensation.json
  ~300 occupations × percentile wages × 50 states × 50 metros
  `);
} else {
  // If called as part of run-all or programmatically
  if (process.argv[1]?.includes('bls-oews-scraper')) {
    runBLSOEWSScraper({}).catch(console.error);
  }
}
