/**
 * Expanded School Target List — 250+ Universities
 *
 * Organized by tier for systematic data collection.
 * Phase 1 of the Admissions SLM training data expansion.
 *
 * Categories:
 *   - Ivy League (8)
 *   - Top Private (35)
 *   - Top Public / Flagship State (55)
 *   - Top Liberal Arts Colleges (30)
 *   - HBCUs (20)
 *   - Rising / Regional Powerhouses (30)
 *   - Strong Regional / State Schools (40)
 *   - Specialized Institutions (15)
 *   - Canadian / International (optional future expansion)
 */

// ==========================================
// TIER 1: ELITE / HIGHLY SELECTIVE (< 15% acceptance)
// ==========================================

export const IVY_LEAGUE = [
  'Harvard University',
  'Yale University',
  'Princeton University',
  'Columbia University in the City of New York',
  'University of Pennsylvania',
  'Brown University',
  'Dartmouth College',
  'Cornell University',
];

export const TOP_PRIVATE = [
  // Already in v1
  'Stanford University',
  'Massachusetts Institute of Technology',
  'California Institute of Technology',
  'Duke University',
  'University of Chicago',
  'Northwestern University',
  'Johns Hopkins University',
  'Rice University',
  'Vanderbilt University',
  'Washington University in St Louis',
  'Emory University',
  'Georgetown University',
  'University of Notre Dame',
  'Carnegie Mellon University',
  'University of Southern California',
  'Tufts University',
  'New York University',
  'Boston University',
  'Boston College',
  'Wake Forest University',
  'Northeastern University',
  'Tulane University of Louisiana',
  'Case Western Reserve University',
  'Lehigh University',
  'Brandeis University',
  'Villanova University',
  'University of Rochester',
  'Rensselaer Polytechnic Institute',
  'Santa Clara University',
  'George Washington University',
  // NEW additions
  'University of Miami',
  'Fordham University',
  'Southern Methodist University',
  'Pepperdine University',
  'Syracuse University',
  'American University',
  'Drexel University',
  'Stevens Institute of Technology',
  'Worcester Polytechnic Institute',
  'Creighton University',
  'Loyola Marymount University',
  'University of San Diego',
  'Marquette University',
  'University of Denver',
  'Gonzaga University',
  'Elon University',
  'Chapman University',
  'University of Dayton',
  'Providence College',
  'University of Richmond',
  'Bucknell University',
  'Lafayette College',
  'College of the Holy Cross',
  'Fairfield University',
  'Bentley University',
  'Babson College',
];

// ==========================================
// TIER 2: TOP PUBLIC / FLAGSHIP STATE UNIVERSITIES
// ==========================================

export const TOP_PUBLIC = [
  // Already in v1
  'University of California-Berkeley',
  'University of California-Los Angeles',
  'University of Michigan-Ann Arbor',
  'University of Virginia-Main Campus',
  'University of North Carolina at Chapel Hill',
  'Georgia Institute of Technology-Main Campus',
  'University of Texas at Austin',
  'University of Florida',
  'University of Wisconsin-Madison',
  'University of Illinois Urbana-Champaign',
  'Ohio State University-Main Campus',
  'Pennsylvania State University-Main Campus',
  'Purdue University-Main Campus',
  'University of Washington-Seattle Campus',
  'University of California-San Diego',
  'University of California-Davis',
  'University of California-Irvine',
  'University of California-Santa Barbara',
  'University of Maryland-College Park',
  'Rutgers University-New Brunswick',
  'University of Georgia',
  'University of Minnesota-Twin Cities',
  'Indiana University-Bloomington',
  'Michigan State University',
  'Virginia Polytechnic Institute and State University',
  'University of Pittsburgh-Pittsburgh Campus',
  'Texas A & M University-College Station',
  'North Carolina State University at Raleigh',
  'University of Connecticut',
  'Clemson University',
  'University of Massachusetts-Amherst',
  'University of Colorado Boulder',
  'University of Iowa',
  'University of Oregon',
  'Arizona State University-Tempe',
  'University of Arizona',
  'Florida State University',
  'University of South Carolina-Columbia',
  'University of Alabama',
  'Colorado School of Mines',
  // NEW additions — remaining flagships + strong publics
  'University of California-Santa Cruz',
  'University of California-Riverside',
  'University of California-Merced',
  'University of Tennessee-Knoxville',
  'University of Kentucky',
  'University of Kansas',
  'University of Missouri-Columbia',
  'University of Nebraska-Lincoln',
  'University of Oklahoma-Norman Campus',
  'University of Arkansas',
  'University of Mississippi',
  'Louisiana State University and Agricultural & Mechanical College',
  'University of Utah',
  'Oregon State University',
  'Washington State University',
  'University of New Mexico-Main Campus',
  'University of Nevada-Reno',
  'University of Hawaii at Manoa',
  'Iowa State University',
  'Kansas State University',
  'Oklahoma State University-Main Campus',
  'Mississippi State University',
  'West Virginia University',
  'University of Vermont',
  'University of New Hampshire-Main Campus',
  'University of Maine',
  'University of Rhode Island',
  'University of Delaware',
  'University of Wyoming',
  'University of Montana-Missoula',
  'University of Idaho',
  'University of North Dakota',
  'University of South Dakota',
  'University of Alaska Fairbanks',
  'Boise State University',
  'San Diego State University',
  'University of Central Florida',
  'University of South Florida-Main Campus',
  'Temple University',
  'University at Buffalo',
  'Stony Brook University',
  'Binghamton University',
  'University at Albany',
  'CUNY City College',
  'CUNY Hunter College',
  'CUNY Baruch College',
  'College of William and Mary',
  'University of Houston',
  'George Mason University',
  'James Madison University',
];

// ==========================================
// TIER 3: TOP LIBERAL ARTS COLLEGES
// ==========================================

export const LIBERAL_ARTS = [
  // Already in v1
  'Williams College',
  'Amherst College',
  'Pomona College',
  'Swarthmore College',
  'Wellesley College',
  'Bowdoin College',
  'Middlebury College',
  'Claremont McKenna College',
  'Carleton College',
  'Davidson College',
  'Colgate University',
  'Hamilton College',
  'Barnard College',
  'Colby College',
  // NEW additions
  'Harvey Mudd College',
  'Haverford College',
  'Vassar College',
  'Grinnell College',
  'Smith College',
  'Colorado College',
  'Macalester College',
  'Oberlin College',
  'Kenyon College',
  'Bates College',
  'Trinity College',
  'Connecticut College',
  'Whitman College',
  'Scripps College',
  'Bryn Mawr College',
  'Mount Holyoke College',
  'Reed College',
  'Occidental College',
  'Denison University',
  'Sewanee-The University of the South',
  'Rhodes College',
  'Furman University',
  'Dickinson College',
  'Gettysburg College',
  'Union College',
  'St. Olaf College',
];

// ==========================================
// TIER 4: HBCUs (Historically Black Colleges & Universities)
// ==========================================

export const HBCUS = [
  'Spelman College',
  'Howard University',
  'Morehouse College',
  'Hampton University',
  'Tuskegee University',
  'Florida Agricultural and Mechanical University',
  'North Carolina A & T State University',
  'Xavier University of Louisiana',
  'Clark Atlanta University',
  'Claflin University',
  'Dillard University',
  'Fisk University',
  'Jackson State University',
  'Morgan State University',
  'Prairie View A & M University',
  'Southern University and A & M College',
  'Tennessee State University',
  'Alabama A & M University',
  'Delaware State University',
  'Bowie State University',
];

// ==========================================
// TIER 5: SPECIALIZED INSTITUTIONS
// ==========================================

export const SPECIALIZED = [
  'United States Military Academy',
  'United States Naval Academy',
  'United States Air Force Academy',
  'Juilliard School',
  'Rhode Island School of Design',
  'Cooper Union for the Advancement of Science and Art',
  'Berklee College of Music',
  'School of the Art Institute of Chicago',
  'Pratt Institute',
  'Savannah College of Art and Design',
  'Fashion Institute of Technology',
  'Embry-Riddle Aeronautical University-Daytona Beach',
  'Rose-Hulman Institute of Technology',
  'Olin College of Engineering',
  'Webb Institute',
];

// ==========================================
// AGGREGATE LISTS
// ==========================================

export const ALL_SCHOOLS = [
  ...IVY_LEAGUE,
  ...TOP_PRIVATE,
  ...TOP_PUBLIC,
  ...LIBERAL_ARTS,
  ...HBCUS,
  ...SPECIALIZED,
];

// Schools that already have strategic intel in v1
export const V1_SCHOOLS = [
  'Harvard University', 'Yale University', 'Princeton University',
  'Columbia University in the City of New York', 'University of Pennsylvania',
  'Brown University', 'Dartmouth College', 'Cornell University',
  'Stanford University', 'Massachusetts Institute of Technology',
  'California Institute of Technology', 'Duke University',
  'University of Chicago', 'Northwestern University',
  'Johns Hopkins University', 'Rice University',
  'Vanderbilt University', 'Washington University in St Louis',
  'Emory University', 'Georgetown University',
  'University of Notre Dame', 'Carnegie Mellon University',
  'University of Southern California', 'Tufts University',
  'New York University', 'Tulane University of Louisiana',
  'Northeastern University', 'Case Western Reserve University',
  'University of California-Berkeley', 'University of California-Los Angeles',
  'University of Michigan-Ann Arbor', 'University of Virginia-Main Campus',
  'University of North Carolina at Chapel Hill', 'Georgia Institute of Technology-Main Campus',
  'University of Texas at Austin', 'University of Wisconsin-Madison',
  'Purdue University-Main Campus', 'University of Washington-Seattle Campus',
  'Virginia Polytechnic Institute and State University',
  'Texas A & M University-College Station',
  'North Carolina State University at Raleigh',
  'Williams College', 'Amherst College', 'Pomona College',
  'Bowdoin College', 'Swarthmore College', 'Wellesley College',
  'University of Florida', 'University of Illinois Urbana-Champaign',
];

// Schools that need NEW strategic intel generated
export const NEW_SCHOOLS = ALL_SCHOOLS.filter(s => !V1_SCHOOLS.includes(s));

export const SCHOOL_CATEGORIES = {
  ivy_league: IVY_LEAGUE,
  top_private: TOP_PRIVATE,
  top_public: TOP_PUBLIC,
  liberal_arts: LIBERAL_ARTS,
  hbcus: HBCUS,
  specialized: SPECIALIZED,
};

// Category tags for training pair generation
export function getSchoolCategory(schoolName) {
  if (IVY_LEAGUE.includes(schoolName)) return 'ivy_league';
  if (TOP_PRIVATE.includes(schoolName)) return 'top_private';
  if (LIBERAL_ARTS.includes(schoolName)) return 'liberal_arts';
  if (HBCUS.includes(schoolName)) return 'hbcu';
  if (SPECIALIZED.includes(schoolName)) return 'specialized';
  if (TOP_PUBLIC.includes(schoolName)) return 'top_public';
  return 'unknown';
}

console.log(`Total schools in expanded list: ${ALL_SCHOOLS.length}`);
console.log(`  Ivy League: ${IVY_LEAGUE.length}`);
console.log(`  Top Private: ${TOP_PRIVATE.length}`);
console.log(`  Top Public: ${TOP_PUBLIC.length}`);
console.log(`  Liberal Arts: ${LIBERAL_ARTS.length}`);
console.log(`  HBCUs: ${HBCUS.length}`);
console.log(`  Specialized: ${SPECIALIZED.length}`);
console.log(`  Already have strategic intel: ${V1_SCHOOLS.length}`);
console.log(`  Need new strategic intel: ${NEW_SCHOOLS.length}`);
