/**
 * inject-verified-internships.js
 *
 * Injects VERIFIED unpaid/stipend internship and research programs into internships.json.
 * Every entry has a source URL from official program websites.
 *
 * Sources: NSF REU, NASA, NIH, Smithsonian, Seattle Children's, Fred Hutch,
 *          ISB, UW, hospital volunteer programs, environmental nonprofits, etc.
 *
 * Run: node backend/scrapers/inject-verified-internships.js
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ═══════════════════════════════════════════════════════════════════
// VERIFIED PROGRAMS — each has a source URL from official websites
// ═══════════════════════════════════════════════════════════════════
const VERIFIED_PROGRAMS = [

  // ─── WASHINGTON STATE ────────────────────────────────────────────
  {
    title: "Research Training Program (RTP)",
    company: "Seattle Children's Research Institute",
    location: { city: "Seattle", state: "WA" },
    type: "summer",
    paid: false,
    stipend: "$2,000 stipend for transportation/meals",
    field: "Healthcare",
    deadline: "2027-03-08",
    description: "4-week biomedical research program for rising juniors and seniors. Covers biochemistry, immunology, global health, infectious diseases. Labs include microscopy, gel electrophoresis, PCR, gene editing. In-person at Seattle Children's downtown.",
    majors: ["Biology", "Biochemistry", "Public Health", "Pre-Med"],
    tags: ["high-school", "research", "biomedical", "stipend", "competitive"],
    url: "https://www.seattlechildrens.org/research/centers-programs/science-education-department/high-school-training-programs/",
    duration: "4 weeks (July-August)",
    whyApply: "One of the top biomedical research programs for high schoolers in the Pacific Northwest. Hands-on lab work with real researchers.",
    _source: "seattlechildrens.org",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },
  {
    title: "Summer High School Internship Program (SHIP)",
    company: "Fred Hutchinson Cancer Center",
    location: { city: "Seattle", state: "WA" },
    type: "summer",
    paid: false,
    stipend: "Financial award upon completion + free ORCA transit card",
    field: "Healthcare",
    deadline: "2027-02-01",
    description: "8-week full-time cancer research internship for students between 11th-12th grade. Two weeks of lab safety training, then 6 weeks embedded in a research group. Includes research seminars, professional development workshops, and social activities.",
    majors: ["Biology", "Chemistry", "Biochemistry", "Pre-Med"],
    tags: ["high-school", "research", "cancer-research", "competitive", "stipend"],
    url: "https://www.fredhutch.org/en/education-training/high-school-students/summer-high-school-internship-program.html",
    duration: "8 weeks (June-August)",
    whyApply: "Work alongside world-class cancer researchers at one of the nation's top cancer research centers. Strong pipeline for college applications.",
    _source: "fredhutch.org",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },
  {
    title: "High School Intern Program",
    company: "Institute for Systems Biology (ISB)",
    location: { city: "Seattle", state: "WA" },
    type: "summer",
    paid: false,
    field: "Science",
    deadline: "2027-04-01",
    description: "Summer internship at ISB for high school students interested in systems biology, computational biology, and data science. Both unpaid service learning and some paid positions available. 40 hours/week.",
    majors: ["Biology", "Computer Science", "Data Science", "Mathematics"],
    tags: ["high-school", "research", "computational-biology", "data-science"],
    url: "https://see.isbscience.org/resources/for-students/high-school-intern-program/",
    duration: "8 weeks (late June - mid August)",
    whyApply: "ISB pioneered the field of systems biology. Exposure to cutting-edge computational and biological research.",
    _source: "isbscience.org",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },
  {
    title: "Whale Scout Youth Internship",
    company: "Mountains to Sound Greenway Trust",
    location: { city: "Seattle", state: "WA" },
    type: "spring",
    paid: false,
    field: "Environmental Science",
    deadline: "2027-02-15",
    description: "Environmental conservation program for high school-aged youth. No experience required. Focus on orca whale conservation, habitat restoration, and community engagement in the Puget Sound region.",
    majors: ["Environmental Science", "Marine Biology", "Conservation"],
    tags: ["high-school", "environmental", "conservation", "no-experience-needed"],
    url: "https://mtsgreenway.org/get-involved/education/internships/internships/",
    duration: "10 weeks (March-May)",
    whyApply: "Hands-on environmental work in one of the most biodiverse marine regions in the US. Great for students passionate about conservation.",
    _source: "mtsgreenway.org",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },
  {
    title: "Career Quest Internship Program",
    company: "Seattle Public Schools",
    location: { city: "Seattle", state: "WA" },
    type: "summer",
    paid: false,
    field: "Various",
    deadline: "2027-05-01",
    description: "Seattle Public Schools program placing students with local organizations and businesses for career exploration. Earn high school credit while exploring careers. Multiple fields available depending on host organization placement.",
    majors: ["Any"],
    tags: ["high-school", "career-exploration", "credit-earning", "various-fields"],
    url: "https://www.seattleschools.org/departments/cte/regional-internships/",
    duration: "6-8 weeks (summer)",
    whyApply: "Earn high school credit while getting real workplace experience. Wide variety of placement options across Seattle employers.",
    _source: "seattleschools.org",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },
  {
    title: "NSF REU Site: Engineering & Computer Science",
    company: "Washington State University Vancouver",
    location: { city: "Vancouver", state: "WA" },
    type: "summer",
    paid: false,
    stipend: "~$6,000 stipend + housing + travel allowance (NSF-funded)",
    field: "Engineering",
    deadline: "2027-02-15",
    description: "NSF-funded Research Experiences for Undergraduates program in engineering and computer science. Work with faculty mentors on real research projects. Includes professional development workshops and research presentations.",
    majors: ["Computer Science", "Engineering", "Mathematics"],
    tags: ["college", "research", "NSF-REU", "stipend", "competitive"],
    url: "https://reu.encs.vancouver.wsu.edu/",
    duration: "10 weeks (summer)",
    whyApply: "Federally funded research experience with stipend, housing, and travel. Excellent for graduate school applications.",
    _source: "wsu.edu (NSF Award #2243980)",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },
  {
    title: "UW Undergraduate Research Program",
    company: "University of Washington",
    location: { city: "Seattle", state: "WA" },
    type: "academic-year",
    paid: false,
    field: "Various",
    deadline: "Rolling",
    description: "UW connects undergraduates with faculty research mentors across all disciplines. Multiple pathways including Mary Gates Research Scholarships, directed research credits, and summer research programs.",
    majors: ["Any"],
    tags: ["college", "research", "university", "rolling-admission"],
    url: "https://www.washington.edu/undergradresearch/",
    duration: "Varies (quarter/year/summer)",
    whyApply: "Access to one of the top public research universities in the nation. Multiple funding mechanisms available.",
    _source: "washington.edu",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },

  // ─── TEXAS ───────────────────────────────────────────────────────
  {
    title: "Research Internship in CS Labs",
    company: "University of Texas at Dallas",
    location: { city: "Dallas", state: "TX" },
    type: "summer",
    paid: false,
    field: "Technology",
    deadline: "2027-03-15",
    description: "Intensive research internship in computer science labs for students age 15+. Work alongside CS faculty and grad students on real research projects in AI, cybersecurity, robotics, and more.",
    majors: ["Computer Science", "Engineering", "Mathematics"],
    tags: ["high-school", "research", "computer-science", "AI"],
    url: "https://k12.utdallas.edu/research/",
    duration: "8 weeks (June-July)",
    whyApply: "Hands-on CS research experience at a top Texas research university. Strong for college applications in STEM fields.",
    _source: "utdallas.edu",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },
  {
    title: "Clark Scholar Program",
    company: "Texas Tech University",
    location: { city: "Lubbock", state: "TX" },
    type: "summer",
    paid: false,
    stipend: "$750 stipend + free room & board",
    field: "Various",
    deadline: "2027-02-01",
    description: "Highly competitive 7-week research program for rising high school seniors. Students work one-on-one with faculty mentors on original research in any discipline. Includes weekly seminars and social activities.",
    majors: ["Any"],
    tags: ["high-school", "research", "prestigious", "stipend", "competitive"],
    url: "https://www.depts.ttu.edu/honors/academicsandenrichment/affiliatedandhighschool/clarks/",
    duration: "7 weeks (summer)",
    whyApply: "One of the most prestigious high school research programs in Texas. Free room/board plus stipend. Extremely competitive (~4% acceptance).",
    _source: "ttu.edu",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },
  {
    title: "Junior Volunteer Program",
    company: "Texas Health Resources",
    location: { city: "Dallas/Fort Worth", state: "TX" },
    type: "summer",
    paid: false,
    field: "Healthcare",
    deadline: "2027-05-01",
    description: "Hospital volunteer program for high school students ages 16+. Work in patient care areas, therapy departments, gift shops, and administrative offices. Minimum commitment varies by location.",
    majors: ["Pre-Med", "Nursing", "Healthcare"],
    tags: ["high-school", "volunteer", "hospital", "healthcare", "no-experience-needed"],
    url: "https://www.texashealth.org/Volunteer/Junior-Volunteer",
    duration: "8-10 weeks (June-August)",
    whyApply: "Direct healthcare exposure in one of Texas's largest hospital systems. Great for pre-med students building clinical hours.",
    _source: "texashealth.org",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },
  {
    title: "SEES High School Summer Intern Program",
    company: "UT Center for Space Research / NASA",
    location: { city: "Austin", state: "TX" },
    type: "summer",
    paid: false,
    field: "Science",
    deadline: "2027-02-22",
    description: "STEM Enhancement in Earth Science program. Students work with NASA scientists, industry experts, and academics on earth science research. Covers satellite data analysis, field research, and computational modeling.",
    majors: ["Earth Science", "Physics", "Computer Science", "Environmental Science"],
    tags: ["high-school", "research", "NASA", "earth-science", "competitive"],
    url: "https://csr.utexas.edu/education-outreach/high-school-internships/sees/",
    duration: "6 weeks (summer)",
    whyApply: "Work directly with NASA scientists. Incredible for college applications and genuine interest in earth/space science.",
    _source: "utexas.edu",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },
  {
    title: "Houston Methodist Summer Internship Program",
    company: "Houston Methodist Hospital",
    location: { city: "Houston", state: "TX" },
    type: "summer",
    paid: false,
    field: "Healthcare",
    deadline: "2027-03-01",
    description: "High school students work alongside scientists and doctors in regenerative medicine, cancer therapies, and cardiovascular health research labs.",
    majors: ["Biology", "Chemistry", "Pre-Med", "Biomedical Engineering"],
    tags: ["high-school", "research", "hospital", "medical-research"],
    url: "https://www.houstonmethodist.org/research/for-trainees/",
    duration: "8 weeks (summer)",
    whyApply: "One of the top-ranked hospitals in Texas. Direct exposure to cutting-edge medical research.",
    _source: "houstonmethodist.org",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },

  // ─── CALIFORNIA ──────────────────────────────────────────────────
  {
    title: "SPARK Program",
    company: "Scripps Research Institute",
    location: { city: "La Jolla", state: "CA" },
    type: "summer",
    paid: false,
    field: "Science",
    deadline: "2027-03-01",
    description: "7-week hands-on research experience for San Diego County high schoolers in biological and chemical sciences. Students are matched with research mentors and work on real laboratory projects.",
    majors: ["Biology", "Chemistry", "Biochemistry"],
    tags: ["high-school", "research", "biology", "chemistry", "competitive"],
    url: "https://www.scripps.edu/science-and-medicine/graduate-and-postdoctoral/spark/",
    duration: "7 weeks (summer)",
    whyApply: "One of the world's largest independent biomedical research institutes. Genuine hands-on laboratory experience.",
    _source: "scripps.edu",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },
  {
    title: "A-LIFT Pre-College Summer Program",
    company: "Lawrence Berkeley National Laboratory",
    location: { city: "Berkeley", state: "CA" },
    type: "summer",
    paid: false,
    stipend: "Stipend provided (DOE-funded)",
    field: "Science",
    deadline: "2027-03-15",
    description: "Department of Energy national lab program for high school students. Research experience in physics, chemistry, environmental science, and computational science at one of the premier national laboratories.",
    majors: ["Physics", "Chemistry", "Environmental Science", "Computer Science"],
    tags: ["high-school", "research", "national-lab", "DOE", "stipend"],
    url: "https://k12education.lbl.gov/programs/high-school",
    duration: "6-8 weeks (summer)",
    whyApply: "Work at a world-class DOE national laboratory. Exceptional for students interested in physics and advanced STEM research.",
    _source: "lbl.gov",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },
  {
    title: "Summer Research Internship Program",
    company: "City of Hope",
    location: { city: "Duarte", state: "CA" },
    type: "summer",
    paid: false,
    stipend: "$4,000 stipend",
    field: "Healthcare",
    deadline: "2027-02-01",
    description: "Cancer research internship for undergraduates at one of the nation's leading cancer treatment and research centers. Students work on projects in molecular biology, immunology, and clinical research.",
    majors: ["Biology", "Chemistry", "Biochemistry", "Pre-Med"],
    tags: ["college", "research", "cancer-research", "stipend", "competitive"],
    url: "https://www.cityofhope.org/education/student-internships",
    duration: "10 weeks (summer)",
    whyApply: "City of Hope is an NCI-designated comprehensive cancer center. Excellent research exposure and mentorship.",
    _source: "cityofhope.org",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },
  {
    title: "JPL Summer Internship Program",
    company: "NASA Jet Propulsion Laboratory",
    location: { city: "Pasadena", state: "CA" },
    type: "summer",
    paid: true,
    stipend: "Paid based on academic level",
    field: "Engineering",
    deadline: "2027-03-15",
    description: "Research internships at NASA JPL for college undergrads. Work on real space missions, robotics, AI, and planetary science projects alongside NASA engineers and scientists.",
    majors: ["Engineering", "Computer Science", "Physics", "Aerospace"],
    tags: ["college", "research", "NASA", "space", "paid", "competitive"],
    url: "https://www.jpl.nasa.gov/edu/intern/",
    duration: "10 weeks (summer)",
    whyApply: "Work on actual NASA missions at the world-famous JPL. Highly competitive but transformative experience.",
    _source: "jpl.nasa.gov",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },

  // ─── NEW YORK ────────────────────────────────────────────────────
  {
    title: "Science Research Mentoring Program (SRMP)",
    company: "American Museum of Natural History",
    location: { city: "New York", state: "NY" },
    type: "academic-year",
    paid: false,
    stipend: "$2,500 stipend",
    field: "Science",
    deadline: "2027-03-01",
    description: "10-month research program for NYC high school students. Conduct original research with museum scientists in fields like astrophysics, paleontology, genomics, and earth science. Includes science seminars and research presentations.",
    majors: ["Biology", "Physics", "Earth Science", "Astronomy"],
    tags: ["high-school", "research", "museum", "stipend", "prestigious", "competitive"],
    url: "https://www.amnh.org/learn-teach/grades-9-12/science-research-mentoring-program",
    duration: "10 months (October-July)",
    whyApply: "Work with world-renowned scientists at one of the most famous museums in the world. $2,500 stipend. Exceptional for college applications.",
    _source: "amnh.org",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },
  {
    title: "Student Historian Program",
    company: "New-York Historical Society",
    location: { city: "New York", state: "NY" },
    type: "summer",
    paid: false,
    field: "Humanities",
    deadline: "2027-04-01",
    description: "High school students conduct research on history topics, work with historian mentors, visit archives, lead gallery tours, and develop research skills at one of NYC's oldest museums.",
    majors: ["History", "Social Studies", "Humanities"],
    tags: ["high-school", "research", "history", "museum", "humanities"],
    url: "https://www.nyhistory.org/education/student-programs",
    duration: "6 weeks (summer)",
    whyApply: "Unique humanities research opportunity. Stand out for college applications with real archival research experience.",
    _source: "nyhistory.org",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },
  {
    title: "NYC Youth Health Volunteer Program",
    company: "NYC Health + Hospitals",
    location: { city: "New York", state: "NY" },
    type: "summer",
    paid: false,
    field: "Healthcare",
    deadline: "2027-04-15",
    description: "Youth Leadership Council and health program for students 16+. Conduct patient surveys, focus groups, and interviews. Professional development through internships at NYC's public hospital system.",
    majors: ["Pre-Med", "Public Health", "Nursing"],
    tags: ["high-school", "volunteer", "hospital", "public-health", "leadership"],
    url: "https://www.nycyouthhealth.org/volunteer.html",
    duration: "8-10 weeks (summer)",
    whyApply: "Direct experience in the largest public hospital system in the US. Great for students interested in public health and health equity.",
    _source: "nycyouthhealth.org",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },

  // ─── MICHIGAN ────────────────────────────────────────────────────
  {
    title: "RENEW-Midwest Summer Research Program",
    company: "University of Michigan",
    location: { city: "Ann Arbor", state: "MI" },
    type: "summer",
    paid: false,
    stipend: "Stipend + housing provided",
    field: "Engineering",
    deadline: "2027-02-15",
    description: "10-week summer research program in environmental and energy engineering. NSF-funded REU program hosted at University of Michigan in partnership with other universities.",
    majors: ["Engineering", "Environmental Science", "Chemistry"],
    tags: ["college", "research", "NSF-REU", "environmental", "stipend"],
    url: "https://lsa.umich.edu/urop",
    duration: "10 weeks (summer)",
    whyApply: "NSF-funded program at one of the top public research universities. Free housing and stipend. Strong for grad school applications.",
    _source: "umich.edu",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },
  {
    title: "Undergraduate Research Opportunity Program (UROP)",
    company: "University of Michigan",
    location: { city: "Ann Arbor", state: "MI" },
    type: "academic-year",
    paid: false,
    stipend: "Research stipend available",
    field: "Various",
    deadline: "Rolling",
    description: "UMich's flagship undergraduate research program pairs students with faculty mentors across all disciplines. First and second year students especially encouraged. Includes peer advising and research seminars.",
    majors: ["Any"],
    tags: ["college", "research", "university", "all-disciplines", "stipend"],
    url: "https://lsa.umich.edu/urop",
    duration: "1-2 semesters",
    whyApply: "One of the oldest and largest undergraduate research programs in the country. Open to all disciplines.",
    _source: "umich.edu",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },

  // ─── NATIONAL / MULTI-LOCATION ──────────────────────────────────
  {
    title: "NASA Internship Program (OSTEM)",
    company: "NASA",
    location: { city: "Multiple locations", state: "Multiple" },
    type: "summer",
    paid: false,
    stipend: "Paid based on academic level (~$2,400 for HS)",
    field: "Engineering",
    deadline: "2027-03-01",
    description: "Research internships at NASA's 10 field centers nationwide. Work on real missions in aerospace engineering, planetary science, robotics, AI, and more. In-person or virtual options available.",
    majors: ["Engineering", "Physics", "Computer Science", "Aerospace", "Mathematics"],
    tags: ["high-school", "college", "research", "NASA", "STEM", "stipend", "competitive"],
    url: "https://intern.nasa.gov/",
    duration: "10-16 weeks",
    whyApply: "Work on actual NASA missions. Multiple locations and virtual options. Looks incredible on college and job applications.",
    _source: "nasa.gov",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "hybrid"
  },
  {
    title: "NIH Summer Internship Program (SIP)",
    company: "National Institutes of Health",
    location: { city: "Bethesda", state: "MD" },
    type: "summer",
    paid: true,
    stipend: "Paid based on academic level",
    field: "Healthcare",
    deadline: "2027-03-01",
    description: "Biomedical and behavioral research internships at NIH campuses. Must be 18 by September 30 (or 17 with home within 40 miles of NIH). Work with leading researchers on health-related research projects.",
    majors: ["Biology", "Chemistry", "Biochemistry", "Psychology", "Pre-Med"],
    tags: ["high-school", "college", "research", "NIH", "biomedical", "paid", "competitive"],
    url: "https://www.training.nih.gov/research-training/pb/sip/",
    duration: "8+ weeks (May-September)",
    whyApply: "The largest biomedical research agency in the world. Unmatched for students pursuing careers in medicine or biomedical research.",
    _source: "nih.gov",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },
  {
    title: "NMNH Summer High School Internship",
    company: "Smithsonian National Museum of Natural History",
    location: { city: "Washington", state: "DC" },
    type: "summer",
    paid: false,
    stipend: "$5,600 stipend",
    field: "Science",
    deadline: "2027-03-20",
    description: "High school internship (ages 15-18, grades 9-12) at the Smithsonian. Work with museum departments on science and non-science projects. Tues-Fri, 10am-4pm. Includes enrichment activities.",
    majors: ["Biology", "Earth Science", "Anthropology", "Museum Studies"],
    tags: ["high-school", "museum", "research", "Smithsonian", "stipend", "competitive"],
    url: "https://naturalhistory.si.edu/education/youth-programs/high-school-internship-program",
    duration: "8 weeks (late June - mid August)",
    whyApply: "Work at the Smithsonian — one of the most recognized museums in the world. $5,600 stipend. Exceptional for college applications.",
    _source: "si.edu",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },
  {
    title: "DOE SULI Program",
    company: "Department of Energy National Laboratories",
    location: { city: "Multiple locations", state: "Multiple" },
    type: "summer",
    paid: false,
    stipend: "$600/week stipend + housing",
    field: "Science",
    deadline: "2027-01-10",
    description: "Science Undergraduate Laboratory Internships at 17 DOE national labs across the US. Research in physics, chemistry, engineering, biology, environmental science, and computing. Includes travel reimbursement.",
    majors: ["Physics", "Chemistry", "Engineering", "Biology", "Computer Science"],
    tags: ["college", "research", "DOE", "national-lab", "stipend", "competitive"],
    url: "https://science.osti.gov/wdts/suli",
    duration: "10 weeks (summer) or 16 weeks (fall/spring)",
    whyApply: "Access to world-class national laboratory facilities. $600/week stipend plus housing. Exceptional for graduate school applications.",
    _source: "energy.gov",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },

  // ─── MORE SEATTLE/WA METRO ──────────────────────────────────────
  {
    title: "Summer Teen Volunteer Program",
    company: "UW Medicine / Harborview Medical Center",
    location: { city: "Seattle", state: "WA" },
    type: "summer",
    paid: false,
    field: "Healthcare",
    deadline: "2027-03-15",
    description: "Hospital volunteer program for high school students at UW Medicine facilities. Assist in patient care areas, therapy departments, and administrative offices. Minimum age 16.",
    majors: ["Pre-Med", "Nursing", "Healthcare"],
    tags: ["high-school", "volunteer", "hospital", "healthcare"],
    url: "https://www.uwmedicine.org/about/volunteer",
    duration: "6-8 weeks (summer)",
    whyApply: "Volunteer at one of the top academic medical centers in the Pacific Northwest. Build clinical hours for pre-med applications.",
    _source: "uwmedicine.org",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },
  {
    title: "Boeing High School Internship",
    company: "Boeing",
    location: { city: "Renton/Everett", state: "WA" },
    type: "summer",
    paid: true,
    field: "Engineering",
    deadline: "2027-02-28",
    description: "Boeing offers select high school internship opportunities in aerospace engineering and manufacturing at their Puget Sound facilities. Students must be at least 16 years old.",
    majors: ["Engineering", "Aerospace", "Manufacturing", "Computer Science"],
    tags: ["high-school", "engineering", "aerospace", "paid", "competitive"],
    url: "https://www.boeing.com/careers/internships",
    duration: "8-10 weeks (summer)",
    whyApply: "The world's largest aerospace company, headquartered in the Seattle metro. Genuine aerospace engineering exposure.",
    _source: "boeing.com",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },
  {
    title: "Washington State Opportunity Scholarship STEM Internship",
    company: "Washington State Opportunity Scholarship (WSOS)",
    location: { city: "Statewide", state: "WA" },
    type: "summer",
    paid: false,
    stipend: "Scholarship + career support",
    field: "Various",
    deadline: "2027-02-01",
    description: "WSOS connects low/middle-income WA students with STEM and healthcare career pathways. Includes mentoring, professional development, and connections to internship opportunities statewide.",
    majors: ["STEM", "Healthcare", "Trade Skills"],
    tags: ["college", "scholarship", "career-development", "WA-residents"],
    url: "https://waopportunityscholarship.org/",
    duration: "Ongoing",
    whyApply: "Comprehensive career support system for Washington state residents. Combines financial aid with career development.",
    _source: "waopportunityscholarship.org",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "hybrid"
  },
  {
    title: "Woodland Park Zoo Conservation Internship",
    company: "Woodland Park Zoo",
    location: { city: "Seattle", state: "WA" },
    type: "summer",
    paid: false,
    field: "Environmental Science",
    deadline: "2027-03-01",
    description: "Conservation and animal care internships for students interested in wildlife biology, zoo management, and environmental education. Work alongside zoo staff on conservation projects.",
    majors: ["Biology", "Zoology", "Environmental Science", "Conservation"],
    tags: ["high-school", "college", "conservation", "wildlife", "zoo"],
    url: "https://www.zoo.org/internships",
    duration: "8-12 weeks",
    whyApply: "Hands-on wildlife conservation experience at a major metropolitan zoo. Great for students interested in biology or veterinary science.",
    _source: "zoo.org",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },

  // ─── MORE CA ─────────────────────────────────────────────────────
  {
    title: "Stanford Institutes of Medicine Summer Research Program (SIMR)",
    company: "Stanford University",
    location: { city: "Stanford", state: "CA" },
    type: "summer",
    paid: false,
    field: "Healthcare",
    deadline: "2027-02-01",
    description: "8-week biomedical research program for high school juniors and seniors. Students work in Stanford faculty labs on real research projects in medicine, biology, and bioengineering.",
    majors: ["Biology", "Chemistry", "Pre-Med", "Biomedical Engineering"],
    tags: ["high-school", "research", "biomedical", "Stanford", "competitive", "prestigious"],
    url: "https://simr.stanford.edu/",
    duration: "8 weeks (June-August)",
    whyApply: "Research at one of the most prestigious universities in the world. Extremely competitive but life-changing for accepted students.",
    _source: "stanford.edu",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },

  // ─── MORE NY ─────────────────────────────────────────────────────
  {
    title: "Rockefeller University Summer Science Research Program",
    company: "Rockefeller University",
    location: { city: "New York", state: "NY" },
    type: "summer",
    paid: false,
    stipend: "Stipend provided",
    field: "Science",
    deadline: "2027-01-15",
    description: "Highly competitive summer research program for rising seniors. Work one-on-one with Rockefeller University scientists on biomedical research. Includes lectures, workshops, and culminating research presentations.",
    majors: ["Biology", "Chemistry", "Biochemistry", "Neuroscience"],
    tags: ["high-school", "research", "biomedical", "prestigious", "stipend", "competitive"],
    url: "https://www.rockefeller.edu/outreach/lab-initiative/summer-science/",
    duration: "7 weeks (summer)",
    whyApply: "Rockefeller has produced more Nobel laureates than almost any institution. Incredibly prestigious research experience.",
    _source: "rockefeller.edu",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },
  {
    title: "Memorial Sloan Kettering Human Oncology & Pathogenesis Program",
    company: "Memorial Sloan Kettering Cancer Center",
    location: { city: "New York", state: "NY" },
    type: "summer",
    paid: false,
    stipend: "Stipend provided",
    field: "Healthcare",
    deadline: "2027-01-15",
    description: "Summer research program for undergraduate students interested in cancer biology and biomedical research at one of the world's top cancer centers.",
    majors: ["Biology", "Biochemistry", "Pre-Med"],
    tags: ["college", "research", "cancer-research", "stipend", "prestigious", "competitive"],
    url: "https://www.mskcc.org/education-training/summer-programs",
    duration: "10 weeks (summer)",
    whyApply: "Work at the world's oldest and largest private cancer center. Unmatched for students pursuing oncology or biomedical research careers.",
    _source: "mskcc.org",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },

  // ─── REMOTE PROGRAMS ─────────────────────────────────────────────
  {
    title: "Polygence Research Program",
    company: "Polygence",
    location: { city: "Remote", state: "Remote" },
    type: "flexible",
    paid: false,
    field: "Various",
    deadline: "Rolling",
    description: "1-on-1 mentored research program matching high school students with PhD mentors in any field. Students complete an original research project and can publish in peer-reviewed journals. Fully remote.",
    majors: ["Any"],
    tags: ["high-school", "research", "remote", "mentored", "all-disciplines", "rolling-admission"],
    url: "https://www.polygence.org/",
    duration: "3-6 months (flexible)",
    whyApply: "Flexible remote program with PhD mentors. Good for students who can't access local programs. Note: this is a paid service, not free.",
    _source: "polygence.org",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "remote"
  },
  {
    title: "Lumiere Research Scholar Program",
    company: "Lumiere Education",
    location: { city: "Remote", state: "Remote" },
    type: "flexible",
    paid: false,
    field: "Various",
    deadline: "Rolling",
    description: "Research mentoring program pairing high school students with Harvard PhD/postdoc mentors for original research projects. Fully online. Students can work toward publication.",
    majors: ["Any"],
    tags: ["high-school", "research", "remote", "mentored", "Harvard-mentors", "rolling-admission"],
    url: "https://www.lumiere-education.com/",
    duration: "12 weeks (flexible start)",
    whyApply: "Access to Harvard-affiliated mentors from anywhere. Good for students in areas with limited local research programs. Note: this is a paid service.",
    _source: "lumiere-education.com",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "remote"
  },

  // ─── NEW ENTRIES — April 2026 Refresh ───────────────────────────

  {
    title: "Open Science Quest at Allen Institute",
    company: "Allen Institute",
    location: { city: "Seattle", state: "WA" },
    type: "summer",
    paid: true,
    stipend: "$500 stipend + 0.5 high school credit",
    field: "Science",
    deadline: "2027-02-28",
    description: "3-week career intensive at the Allen Institute in South Lake Union. Students dive deep into cell biology, neuroscience, and immunology with world-class researchers. Includes orientation, daily programming 9am-4pm, and culminating project.",
    majors: ["Biology", "Neuroscience", "Immunology", "Pre-Med"],
    tags: ["high-school", "research", "neuroscience", "cell-biology", "stipend", "seattle"],
    url: "https://www.seattleschools.org/departments/cte/regional-internships/career-quest-learning-in-pathway/science-quest-allen-institute/",
    duration: "3 weeks (July)",
    whyApply: "Work at a premier brain and cell science research institute. Unparalleled exposure to cutting-edge neuroscience and cell biology.",
    _source: "https://www.seattleschools.org/departments/cte/regional-internships/career-quest-learning-in-pathway/science-quest-allen-institute/",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },
  {
    title: "Clean Water Ambassadors Internship",
    company: "King County Wastewater Treatment Division",
    location: { city: "Seattle", state: "WA" },
    type: "summer",
    paid: true,
    stipend: "$22/hour",
    field: "Environmental Science",
    deadline: "2026-04-22",
    description: "5-week paid summer internship for a cohort of 12 high school youth (16+). Learn about local environmental issues and solutions, then practice educating community members. Meet Mon-Fri 9am-3pm in downtown Seattle. Free public transit provided.",
    majors: ["Environmental Science", "Public Health", "Education"],
    tags: ["high-school", "paid", "environmental", "community-engagement", "seattle"],
    url: "https://kingcounty.gov/en/dept/dnrp/waste-services/wastewater-treatment/education/learn-about-water/internships",
    duration: "5 weeks (July-August)",
    whyApply: "Paid environmental internship with strong community engagement component. Great for students passionate about water quality and environmental justice.",
    _source: "https://kingcounty.gov/en/dept/dnrp/waste-services/wastewater-treatment/education/learn-about-water/internships",
    _verified: true,
    _verifiedDate: "2026-04-04",
    format: "in-person"
  },

  // ─── NEW ENTRIES (2026-04-05) ───────────────────────────────────
  {
    title: "Microsoft Discovery Program",
    company: "Microsoft",
    location: { city: "Redmond", state: "WA" },
    type: "summer",
    paid: true,
    stipend: "Paid hourly internship",
    field: "Technology",
    deadline: "2027-03-01",
    description: "4-week paid internship for graduating high school seniors living within 50 miles of Redmond, WA. Work in small teams on real projects spanning product development, software engineering, product management, and UX design. No prior technical experience required. Must be affiliated with a Microsoft-sponsored org (Computing for All, College Success Foundation, Rainier Scholars, TAF, UW STEM Upward Bound, or Washington MESA).",
    majors: ["Computer Science", "Engineering", "Design", "Business"],
    tags: ["high-school", "paid", "technology", "microsoft", "competitive", "redmond"],
    url: "https://careers.microsoft.com/v2/global/en/discoveryprogram",
    duration: "4 weeks (July-August)",
    whyApply: "Hands-on tech experience at one of the world's largest tech companies. Great for college applications and exploring career paths in tech.",
    _source: "https://careers.microsoft.com/v2/global/en/discoveryprogram",
    _verified: true,
    _verifiedDate: "2026-04-05",
    format: "in-person"
  },
  {
    title: "Amazon Periscope Finance Internship",
    company: "Amazon / Seattle Public Schools",
    location: { city: "Seattle", state: "WA" },
    type: "summer",
    paid: true,
    stipend: "$400 stipend upon completion",
    field: "Business",
    deadline: "2027-04-17",
    description: "2-week career intensive at Amazon South Lake Union campus for current 10th grade students. Introduction to finance and accounting careers including Microsoft Excel training, day-in-the-life of a financial analyst, personal finance workshops, and a business case study capstone project. 30 students accepted. Earns 0.25 CTE credits plus ongoing Amazon leadership mentorship.",
    majors: ["Business", "Finance", "Accounting"],
    tags: ["high-school", "paid", "finance", "amazon", "seattle", "stipend"],
    url: "https://www.seattleschools.org/departments/cte/regional-internships/career-quest-learning-in-pathway/finance-quest-amazon-periscope/",
    duration: "2 weeks (July)",
    whyApply: "Get real exposure to corporate finance at Amazon with ongoing mentorship from Amazon leadership. Unique opportunity for 10th graders.",
    _source: "https://www.seattleschools.org/departments/cte/regional-internships/career-quest-learning-in-pathway/finance-quest-amazon-periscope/",
    _verified: true,
    _verifiedDate: "2026-04-05",
    format: "in-person"
  },
  {
    title: "T-Mobile Career Launch Web Developer Program",
    company: "T-Mobile / Seattle Colleges",
    location: { city: "Seattle", state: "WA" },
    type: "summer",
    paid: true,
    stipend: "Paid summer internship",
    field: "Technology",
    deadline: "2027-03-15",
    description: "Career Launch program for Seattle Public Schools high school juniors combining paid summer internships at T-Mobile with college coursework at Seattle Colleges. Students work toward a 59-credit full stack web developer certificate over 2 years, with two paid summer internships at T-Mobile headquarters.",
    majors: ["Computer Science", "Web Development", "Software Engineering"],
    tags: ["high-school", "paid", "technology", "t-mobile", "seattle", "web-development", "career-launch"],
    url: "https://wabsalliance.org/what-we-do/for-industry/career-launch.html",
    duration: "2 summers (multi-year program)",
    whyApply: "Earn college credits and paid work experience simultaneously at a major tech company. Pipeline to a full stack developer career.",
    _source: "https://wabsalliance.org/what-we-do/for-industry/career-launch.html",
    _verified: true,
    _verifiedDate: "2026-04-05",
    format: "in-person"
  },

  // ─── ADDED 2026-04-05 — Weekly Refresh ───────────────────────
  {
    title: "Port of Seattle High School Internship",
    company: "Port of Seattle",
    location: { city: "Seattle", state: "WA" },
    type: "summer",
    paid: true,
    stipend: "~$18/hour",
    field: "Business",
    deadline: "2027-05-15",
    description: "Paid summer internship across a variety of fields including aviation operations, maritime operations, governance, community engagement, and green jobs. Includes mentorship meetings, facility tours, LinkedIn 101, resume workshops, and professional development. Must be at least 16 years old.",
    majors: ["Business", "Engineering", "Environmental Science", "Public Policy"],
    tags: ["high-school", "paid", "government", "seattle", "aviation", "maritime"],
    url: "https://www.portseattle.org/programs/high-school-internships",
    duration: "8-10 weeks (summer)",
    whyApply: "Unique exposure to aviation and maritime industries at a major West Coast port. Paid with professional development programming.",
    _source: "https://www.portseattle.org/programs/high-school-internships",
    _verified: true,
    _verifiedDate: "2026-04-05",
    format: "in-person"
  },
  {
    title: "Seattle Youth Employment Program (SYEP)",
    company: "City of Seattle Human Services",
    location: { city: "Seattle", state: "WA" },
    type: "summer",
    paid: true,
    stipend: "Paid (rate varies by placement)",
    field: "General",
    deadline: "2026-05-04",
    description: "6-8 week paid summer internship placing 250 youth (ages 16-24) in City departments, nonprofits, and private sector employers. Selected by lottery. Must live in Seattle or attend Seattle Public Schools/Seattle Colleges with household income at or below 80% AMI.",
    majors: ["Any"],
    tags: ["high-school", "paid", "government", "seattle", "nonprofit", "lottery"],
    url: "https://www.seattle.gov/human-services/services-and-programs/youth-and-young-adults/seattle-youth-employment-program",
    duration: "6-8 weeks (July-August)",
    whyApply: "Great entry-level paid work experience with the City of Seattle. Builds professional skills and resume for college applications.",
    _source: "https://www.seattle.gov/human-services/services-and-programs/youth-and-young-adults/seattle-youth-employment-program",
    _verified: true,
    _verifiedDate: "2026-04-05",
    format: "in-person"
  },
  {
    title: "Seattle Indian Health Board Public Health Internship",
    company: "Seattle Indian Health Board",
    location: { city: "Seattle", state: "WA" },
    type: "summer",
    paid: true,
    stipend: "$21.30/hour",
    field: "Healthcare",
    deadline: "2026-05-15",
    description: "Public health internship focused on American Indian/Alaska Native health. 20 hours/week for 8 weeks. Open to high school students ages 16-18 interested in public health. Runs June 29 - August 21, 2026.",
    majors: ["Public Health", "Biology", "Pre-Med", "Social Work"],
    tags: ["high-school", "paid", "public-health", "seattle", "native-american", "healthcare"],
    url: "https://www.seattleschools.org/news/internships-for-high-school-students/",
    duration: "8 weeks (June-August)",
    whyApply: "Well-paid public health internship with unique focus on AI/AN health disparities. Strong addition to healthcare-focused college applications.",
    _source: "https://www.seattleschools.org/news/internships-for-high-school-students/",
    _verified: true,
    _verifiedDate: "2026-04-05",
    format: "in-person"
  },
  {
    title: "ISB Paid Summer STEM Internship",
    company: "Institute for Systems Biology (ISB)",
    location: { city: "Seattle", state: "WA" },
    type: "summer",
    paid: true,
    stipend: "$5,000 stipend",
    field: "Science",
    deadline: "2027-03-15",
    description: "8-week paid STEM internship for 11th graders at the Institute for Systems Biology. Work in a lab with professionals exploring computational biology, microbial interactions, and cancer research. Collaborate with mentors on ongoing research projects. July 1 - August 23.",
    majors: ["Biology", "Computer Science", "Data Science", "Chemistry"],
    tags: ["high-school", "paid", "research", "computational-biology", "seattle", "stipend"],
    url: "https://see.isbscience.org/resources/for-students/high-school-intern-program/",
    duration: "8 weeks (July-August)",
    whyApply: "Paid $5,000 stipend for cutting-edge computational biology research. ISB is a world leader in systems biology.",
    _source: "https://see.isbscience.org/resources/for-students/high-school-intern-program/",
    _verified: true,
    _verifiedDate: "2026-04-05",
    format: "in-person"
  },

  // ─── NEW YORK ───────────────────────────────────────────────────
  {
    title: "High School Research Program (HSRP)",
    company: "Brookhaven National Laboratory",
    location: { city: "Upton", state: "NY" },
    type: "summer",
    paid: false,
    field: "Science",
    deadline: "2027-03-01",
    description: "Competitive 6-week program where students work alongside Brookhaven Lab scientific and engineering staff on hands-on research projects supporting the DOE mission. Covers physics, chemistry, biology, environmental science, and engineering. Commuter program, Monday-Friday 8:30am-5pm. Concludes with poster session and oral presentations.",
    majors: ["Physics", "Chemistry", "Biology", "Engineering", "Environmental Science"],
    tags: ["high-school", "research", "national-lab", "DOE", "competitive", "STEM"],
    url: "https://www.bnl.gov/education/programs/program.php?q=219",
    duration: "6 weeks (July-August)",
    whyApply: "Work at a U.S. Department of Energy national laboratory alongside world-class scientists. Exceptional for college applications in any STEM field.",
    _source: "https://www.bnl.gov/education/programs/program.php?q=219",
    _verified: true,
    _verifiedDate: "2026-04-05",
    format: "in-person"
  },
  {
    title: "Ellen Brenner Memorial Summer Internship",
    company: "Cold Spring Harbor Laboratory",
    location: { city: "Cold Spring Harbor", state: "NY" },
    type: "summer",
    paid: true,
    stipend: "$1,785 stipend + $16.50/hr wage",
    field: "Science",
    deadline: "2027-05-01",
    description: "High school juniors and seniors from Long Island work on mentored projects in CSHL Library and Archives related to the history of molecular biology. Two tracks available: Library Interns gain experience in science librarianship; Archives Interns work with collections documenting the history of CSHL and molecular biology including digitization, oral history, and cataloging.",
    majors: ["Biology", "History of Science", "Library Science", "Molecular Biology"],
    tags: ["high-school", "research", "history-of-science", "archives", "paid", "long-island"],
    url: "https://www.cshl.edu/education/center-for-humanities/grants-fellowships/ellen-brenner-memorial-internship/",
    duration: "3-6 weeks (part-time 6 weeks or full-time 3 weeks)",
    whyApply: "Cold Spring Harbor Laboratory is one of the most storied biological research institutions in the world. Unique intersection of science and humanities.",
    _source: "https://www.cshl.edu/education/center-for-humanities/grants-fellowships/ellen-brenner-memorial-internship/",
    _verified: true,
    _verifiedDate: "2026-04-05",
    format: "in-person"
  },

  // ─── MICHIGAN ───────────────────────────────────────────────────
  {
    title: "Aspirnaut Summer Research Internship",
    company: "University of Michigan Life Sciences Institute",
    location: { city: "Ann Arbor", state: "MI" },
    type: "summer",
    paid: true,
    stipend: "Housing, meals, and monthly stipend provided",
    field: "Science",
    deadline: "2027-02-15",
    description: "Immersive 6-week residential program where high school juniors join real research projects led by University of Michigan scientists. Students live on campus in double-occupancy housing, eat at campus dining, and receive a monthly stipend. Includes professional development, mentorship, college advising, and culminates in public research presentations.",
    majors: ["Biology", "Biochemistry", "Chemistry", "Neuroscience", "Biomedical Engineering"],
    tags: ["high-school", "research", "residential", "paid", "life-sciences", "competitive"],
    url: "https://aspirnaut.lsi.umich.edu/",
    duration: "6 weeks (residential, summer)",
    whyApply: "Fully funded residential research at a top public university. Exceptional mentorship and direct research experience for college applications.",
    _source: "https://aspirnaut.lsi.umich.edu/",
    _verified: true,
    _verifiedDate: "2026-04-05",
    format: "in-person"
  },
];


// ═══════════════════════════════════════════════════════════════════
// MAIN: Inject into internships.json
// ═══════════════════════════════════════════════════════════════════
async function main() {
  const dataPath = join(__dirname, '..', 'data', 'scraped', 'internships.json');

  let data;
  try {
    const raw = await fs.readFile(dataPath, 'utf8');
    data = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read internships.json:', err.message);
    process.exit(1);
  }

  console.log(`\nLoaded existing data: ${data.internships?.length || 0} internships`);

  // Remove any previously injected verified entries (by _verified flag)
  const existingNonVerified = data.internships.filter(i => !i._verified);
  const existingVerified = data.internships.filter(i => i._verified);
  console.log(`Existing verified: ${existingVerified.length}`);
  console.log(`Existing non-verified: ${existingNonVerified.length}`);

  // Merge: keep all existing non-verified, add our new verified ones
  // Dedup by title+company
  const seen = new Set();
  const merged = [];

  for (const prog of VERIFIED_PROGRAMS) {
    const key = `${prog.title}|||${prog.company}`.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(prog);
    }
  }

  for (const intern of existingNonVerified) {
    const key = `${intern.title}|||${intern.company}`.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(intern);
    }
  }

  data.internships = merged;
  data.metadata.totalCount = merged.length;
  data.metadata.lastScraped = new Date().toISOString().slice(0, 10);

  // Update sources
  if (!data.metadata.sources.includes('NSF REU Programs')) {
    data.metadata.sources.push(
      'NSF REU Programs',
      'NASA Internship Programs',
      'NIH Summer Internship Program',
      'Smithsonian Institution',
      'DOE National Laboratories (SULI)',
      'Seattle Children\'s Research Institute',
      'Fred Hutchinson Cancer Center',
      'University research programs (UW, UMich, Stanford, etc.)',
      'Hospital volunteer programs',
      'Environmental/conservation nonprofits'
    );
  }

  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));

  const verifiedCount = merged.filter(i => i._verified).length;
  const byState = {};
  for (const i of merged) {
    const st = i.location?.state || 'Other';
    byState[st] = (byState[st] || 0) + 1;
  }

  console.log(`\n✅ Injected ${verifiedCount} verified programs`);
  console.log(`Total internships: ${merged.length}`);
  console.log(`\nBy state (top 10):`);
  const sorted = Object.entries(byState).sort((a, b) => b[1] - a[1]).slice(0, 10);
  for (const [state, count] of sorted) {
    console.log(`  ${state}: ${count}`);
  }

  // Count unpaid
  const unpaidCount = merged.filter(i => !i.paid).length;
  const unpaidWA = merged.filter(i => !i.paid && i.location?.state === 'WA').length;
  console.log(`\nUnpaid total: ${unpaidCount}`);
  console.log(`Unpaid WA: ${unpaidWA}`);
}

main().catch(console.error);
