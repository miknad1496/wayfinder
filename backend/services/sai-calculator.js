/**
 * SAI (Student Aid Index) Calculator — 2025-26 FAFSA Formula A (Dependent Students)
 *
 * Implements the federal SAI calculation methodology per the 2025-26 Student Aid Index
 * and Pell Grant Eligibility Guide published by Federal Student Aid (fsapartners.ed.gov).
 *
 * Key changes from old EFC:
 * - State tax allowance ELIMINATED
 * - Asset protection allowance reduced to $0 for 2025-26
 * - Minimum SAI is -$1,500 (can go negative, unlike old EFC)
 * - Number in college NO LONGER reduces parent contribution
 * - Small business/farm assets NOW counted
 * - Grandparent-owned 529s NO LONGER reported
 *
 * DISCLAIMER: This is an ESTIMATE. File the actual FAFSA at studentaid.gov for your real SAI.
 *
 * Sources:
 * - 2025-26 SAI and Pell Grant Eligibility Guide (fsapartners.ed.gov)
 * - Federal Register: Federal Need Analysis Methodology for 2025-26 Award Year
 * - NASFAA FAFSA Simplification resources
 */

// ═══════════════════════════════════════════════════════════════════
// TABLE A1: Payroll Tax Rates (based on 2023 tax year for 2025-26 FAFSA)
// ═══════════════════════════════════════════════════════════════════
const SS_WAGE_BASE_2023 = 160200;
const SS_RATE = 0.062;   // Social Security 6.2%
const MEDICARE_RATE = 0.0145; // Medicare 1.45%

function calculatePayrollTax(earnedIncome) {
  if (earnedIncome <= 0) return 0;
  const ssTax = Math.min(earnedIncome, SS_WAGE_BASE_2023) * SS_RATE;
  const medicareTax = earnedIncome * MEDICARE_RATE;
  return Math.round(ssTax + medicareTax);
}

// ═══════════════════════════════════════════════════════════════════
// TABLE A2: Income Protection Allowance (Parents of Dependent Students)
// Based on family size. For 2025-26 award year.
// ═══════════════════════════════════════════════════════════════════
const INCOME_PROTECTION_ALLOWANCE = {
  2: 28530,
  3: 35510,
  4: 43870,
  5: 51750,
  6: 60540,
};
const IPA_ADDITIONAL_MEMBER = 6840;

function getIncomeProtectionAllowance(familySize) {
  if (familySize <= 2) return INCOME_PROTECTION_ALLOWANCE[2];
  if (familySize <= 6) return INCOME_PROTECTION_ALLOWANCE[familySize];
  return INCOME_PROTECTION_ALLOWANCE[6] + (familySize - 6) * IPA_ADDITIONAL_MEMBER;
}

// ═══════════════════════════════════════════════════════════════════
// Employment Expense Allowance
// Lesser of $4,890 or 35% of the lower earned income (if two parents work)
// ═══════════════════════════════════════════════════════════════════
const EMPLOYMENT_EXPENSE_MAX = 4890;
const EMPLOYMENT_EXPENSE_RATE = 0.35;

function getEmploymentExpenseAllowance(parent1Earned, parent2Earned) {
  // Only applies when both parents have earned income
  if (!parent1Earned || !parent2Earned || parent2Earned <= 0) return 0;
  const lowerIncome = Math.min(parent1Earned, parent2Earned);
  return Math.min(EMPLOYMENT_EXPENSE_MAX, Math.round(lowerIncome * EMPLOYMENT_EXPENSE_RATE));
}

// ═══════════════════════════════════════════════════════════════════
// TABLE A4: Asset Protection Allowance (Parents)
// CRITICAL: Reduced to $0 for 2025-26 due to inflation adjustment methodology
// This is a major change — all parent assets now assessed with no shelter.
// ═══════════════════════════════════════════════════════════════════
const PARENT_ASSET_PROTECTION_ALLOWANCE = 0; // $0 for 2025-26

// Parent asset conversion rate: 5.64% of discretionary net worth
const PARENT_ASSET_CONVERSION_RATE = 0.0564;

// ═══════════════════════════════════════════════════════════════════
// TABLE A5: Parents' Contribution from Adjusted Available Income (AAI)
// Progressive assessment rates
// ═══════════════════════════════════════════════════════════════════
const AAI_BRACKETS = [
  { upTo: -8300,  rate: 0,    base: -1826, note: 'Floor: minimum parent contribution' },
  { upTo: 0,      rate: 0.22, base: 0,     subtract: -8300 },
  { upTo: 21300,  rate: 0.22, base: 0,     subtract: 0 },
  { upTo: 26700,  rate: 0.25, base: 4686,  subtract: 21300 },
  { upTo: 32000,  rate: 0.29, base: 6036,  subtract: 26700 },
  { upTo: 37500,  rate: 0.34, base: 7573,  subtract: 32000 },
  { upTo: 42900,  rate: 0.40, base: 9443,  subtract: 37500 },
  { upTo: Infinity, rate: 0.47, base: 11603, subtract: 42900 },
];

function calculateParentContributionFromAAI(aai) {
  // Minimum parent contribution floor
  if (aai <= -8300) return -1826;

  // Handle negative AAI between -8300 and 0
  if (aai < 0) {
    return Math.round(aai * 0.22);
  }

  // Progressive brackets for positive AAI
  for (const bracket of AAI_BRACKETS) {
    if (bracket.subtract === undefined) continue;
    if (aai <= bracket.upTo) {
      return Math.round(bracket.base + (aai - bracket.subtract) * bracket.rate);
    }
  }

  // Above highest bracket
  const last = AAI_BRACKETS[AAI_BRACKETS.length - 1];
  return Math.round(last.base + (aai - last.subtract) * last.rate);
}

// ═══════════════════════════════════════════════════════════════════
// Student Income & Asset Constants
// ═══════════════════════════════════════════════════════════════════
const STUDENT_INCOME_PROTECTION_ALLOWANCE = 11510; // 2025-26
const STUDENT_INCOME_ASSESSMENT_RATE = 0.50;       // 50% of available income
const STUDENT_ASSET_CONVERSION_RATE = 0.20;        // 20% of all student assets

// ═══════════════════════════════════════════════════════════════════
// Maximum Pell Grant Eligibility (replaces old "Automatic Zero EFC")
// Under FAFSA Simplification: families with AGI ≤ 175% of poverty
// (225% for single parents) get MAXIMUM Pell Grant.
// This doesn't set SAI to -1500, but ensures max Pell eligibility.
// ═══════════════════════════════════════════════════════════════════
const POVERTY_GUIDELINES_2023 = {
  // 2023 HHS Poverty Guidelines (used for 2025-26 FAFSA)
  // Continental US
  base: 14580,
  perPerson: 5140,
};

function getPovertyThreshold(familySize, state, singleParent = false) {
  // Alaska and Hawaii have higher thresholds
  let base = POVERTY_GUIDELINES_2023.base;
  let perPerson = POVERTY_GUIDELINES_2023.perPerson;
  if (state === 'AK') { base = 18210; perPerson = 6430; }
  if (state === 'HI') { base = 16770; perPerson = 5910; }

  const povertyLine = base + Math.max(0, familySize - 1) * perPerson;
  // 225% for single parents, 175% for two-parent households
  const multiplier = singleParent ? 2.25 : 1.75;
  return Math.round(povertyLine * multiplier);
}

// Asset exclusion: if combined parent AGI < $60,000, assets may be excluded
const ASSET_EXCLUSION_THRESHOLD = 60000;

// ═══════════════════════════════════════════════════════════════════
// Pell Grant Eligibility (2025-26)
// ═══════════════════════════════════════════════════════════════════
const MAX_PELL_GRANT_2025_26 = 7395;
const MIN_PELL_GRANT_2025_26 = 740;  // Minimum Pell award
const PELL_SAI_CUTOFF = MAX_PELL_GRANT_2025_26 - MIN_PELL_GRANT_2025_26; // SAI above this = no Pell ($6,655)

function estimatePellGrant(sai) {
  if (sai <= 0) return MAX_PELL_GRANT_2025_26;
  // Pell = Max Pell - SAI (must be ≥ minimum Pell to receive anything)
  const pell = MAX_PELL_GRANT_2025_26 - sai;
  if (pell < MIN_PELL_GRANT_2025_26) return 0;
  return pell;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN SAI CALCULATION — Formula A (Dependent Students)
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate the Student Aid Index for a dependent student
 * @param {Object} input - All financial inputs
 * @returns {Object} Detailed SAI breakdown with every step shown
 */
export function calculateSAI(input) {
  const {
    // Parent income
    parentAGI = 0,                 // Parents' Adjusted Gross Income (2023 tax return)
    parentFederalTaxPaid = 0,      // Federal income tax paid
    parentUntaxedIncome = 0,       // Untaxed income & benefits (IRA deductions, tax-exempt interest, etc.)
    parent1EarnedIncome = 0,       // Parent 1 earned income from work
    parent2EarnedIncome = 0,       // Parent 2 earned income (0 if single parent)

    // Parent assets
    parentCashSavingsInvestments = 0,  // Cash, savings, checking, investments (NOT retirement accounts)
    parentBusinessFarmNetWorth = 0,     // Net worth of business/farm (now counted under SAI)

    // Family info
    familySize = 4,                // Total number in household
    parentMaritalStatus = 'married', // 'married', 'single', 'divorced', 'widowed'
    olderParentAge = 45,           // Age of older parent (for future APA restoration)
    stateOfResidence = 'WA',       // Two-letter state code

    // Student income
    studentAGI = 0,                // Student's AGI (from 2023 tax return)
    studentFederalTaxPaid = 0,     // Student's federal tax paid
    studentEarnedIncome = 0,       // Student's earned income from work

    // Student assets
    studentAssets = 0,             // Student's total assets (savings, investments, etc.)

    // Special circumstances
    receivedMeansTestedBenefit = false, // SNAP, TANF, SSI, Medicaid, free/reduced lunch, WIC
  } = input;

  const result = {
    inputs: { ...input },
    steps: {},
    warnings: [],
    tips: [],
  };

  // ─── STEP 0: Check Maximum Pell Grant Eligibility ──────────────
  const totalParentIncome = parentAGI + parentUntaxedIncome;
  const isSingleParent = parentMaritalStatus !== 'married';
  const povertyThreshold = getPovertyThreshold(familySize, stateOfResidence, isSingleParent);
  const qualifiesForMaxPell = totalParentIncome <= povertyThreshold;

  result.steps.maxPellCheck = {
    totalParentIncome,
    povertyThreshold,
    multiplier: isSingleParent ? '225%' : '175%',
    qualifiesForMaxPell,
    note: qualifiesForMaxPell
      ? 'Income below poverty threshold — qualifies for Maximum Pell Grant regardless of calculated SAI'
      : 'Income above poverty threshold — Pell eligibility determined by calculated SAI',
  };

  if (qualifiesForMaxPell) {
    result.tips.push(`Your family income ($${totalParentIncome.toLocaleString()}) is below ${isSingleParent ? '225%' : '175%'} of the federal poverty guideline ($${povertyThreshold.toLocaleString()} for a family of ${familySize}). This qualifies for the Maximum Pell Grant of $${MAX_PELL_GRANT_2025_26.toLocaleString()}/year.`);
  }

  // ─── STEP 1: Parents' Total Income ─────────────────────────────
  const parentTotalIncome = parentAGI + parentUntaxedIncome;
  result.steps.parentTotalIncome = {
    agi: parentAGI,
    untaxedIncome: parentUntaxedIncome,
    total: parentTotalIncome,
  };

  // ─── STEP 2: Parents' Allowances Against Income ────────────────

  // 2a. Federal taxes paid
  const taxAllowance = Math.max(0, parentFederalTaxPaid);

  // 2b. Payroll tax allowance (FICA)
  const totalParentEarned = parent1EarnedIncome + parent2EarnedIncome;
  const payrollTax = calculatePayrollTax(totalParentEarned);

  // 2c. Income protection allowance (by family size)
  const ipa = getIncomeProtectionAllowance(familySize);

  // 2d. Employment expense allowance (two-working-parent families)
  const isTwoParentHousehold = parentMaritalStatus === 'married';
  const employmentExpense = isTwoParentHousehold
    ? getEmploymentExpenseAllowance(parent1EarnedIncome, parent2EarnedIncome)
    : 0;

  const totalAllowances = taxAllowance + payrollTax + ipa + employmentExpense;

  result.steps.parentAllowances = {
    federalTaxPaid: taxAllowance,
    payrollTax,
    incomeProtectionAllowance: ipa,
    employmentExpenseAllowance: employmentExpense,
    totalAllowances,
    familySize,
  };

  // ─── STEP 3: Parents' Available Income ─────────────────────────
  const parentAvailableIncome = parentTotalIncome - totalAllowances;
  result.steps.parentAvailableIncome = {
    totalIncome: parentTotalIncome,
    minusAllowances: totalAllowances,
    availableIncome: parentAvailableIncome,
  };

  // ─── STEP 4: Parents' Contribution from Assets ─────────────────
  // NOTE: If combined parent AGI < $60,000, assets may be excluded from FAFSA
  const assetExcluded = parentAGI < ASSET_EXCLUSION_THRESHOLD;
  const parentNetWorth = assetExcluded ? 0 : (parentCashSavingsInvestments + parentBusinessFarmNetWorth);
  const discretionaryNetWorth = Math.max(0, parentNetWorth - PARENT_ASSET_PROTECTION_ALLOWANCE);
  const parentAssetContribution = Math.round(discretionaryNetWorth * PARENT_ASSET_CONVERSION_RATE);

  result.steps.parentAssets = {
    cashSavingsInvestments: parentCashSavingsInvestments,
    businessFarmNetWorth: parentBusinessFarmNetWorth,
    totalNetWorth: assetExcluded ? 0 : (parentCashSavingsInvestments + parentBusinessFarmNetWorth),
    assetExcluded,
    assetExclusionNote: assetExcluded
      ? `Parent AGI ($${parentAGI.toLocaleString()}) is below $60,000 — assets excluded from FAFSA calculation`
      : null,
    assetProtectionAllowance: PARENT_ASSET_PROTECTION_ALLOWANCE,
    discretionaryNetWorth,
    conversionRate: '5.64%',
    assetContribution: parentAssetContribution,
  };

  if (assetExcluded && (parentCashSavingsInvestments + parentBusinessFarmNetWorth) > 0) {
    result.tips.push(`Good news: because your parent AGI is below $60,000, your assets ($${(parentCashSavingsInvestments + parentBusinessFarmNetWorth).toLocaleString()}) are excluded from the FAFSA calculation. This saves you $${Math.round((parentCashSavingsInvestments + parentBusinessFarmNetWorth) * PARENT_ASSET_CONVERSION_RATE).toLocaleString()} on your SAI.`);
  }

  if (!assetExcluded && PARENT_ASSET_PROTECTION_ALLOWANCE === 0 && parentNetWorth > 0) {
    result.warnings.push('For 2025-26, the Asset Protection Allowance is $0. All parent assets (except retirement accounts) are assessed at 5.64%. This is a significant change from prior years.');
  }

  // ─── STEP 5: Parents' Adjusted Available Income (AAI) ──────────
  const aai = parentAvailableIncome + parentAssetContribution;
  result.steps.adjustedAvailableIncome = {
    availableIncome: parentAvailableIncome,
    plusAssetContribution: parentAssetContribution,
    aai,
  };

  // ─── STEP 6: Parents' Contribution from AAI ────────────────────
  const parentContribution = calculateParentContributionFromAAI(aai);

  // Find which bracket applies for display
  let bracketDescription = '';
  if (aai <= -8300) {
    bracketDescription = 'Floor: -$1,826 (minimum parent contribution)';
  } else if (aai < 0) {
    bracketDescription = '22% of negative AAI';
  } else if (aai <= 21300) {
    bracketDescription = '22% of AAI';
  } else if (aai <= 26700) {
    bracketDescription = '$4,686 + 25% of AAI over $21,300';
  } else if (aai <= 32000) {
    bracketDescription = '$6,036 + 29% of AAI over $26,700';
  } else if (aai <= 37500) {
    bracketDescription = '$7,573 + 34% of AAI over $32,000';
  } else if (aai <= 42900) {
    bracketDescription = '$9,443 + 40% of AAI over $37,500';
  } else {
    bracketDescription = '$11,603 + 47% of AAI over $42,900';
  }

  result.steps.parentContribution = {
    aai,
    assessmentBracket: bracketDescription,
    parentContribution,
  };

  // ─── STEP 7: Student's Contribution from Income ────────────────
  const studentTotalIncome = studentAGI;
  const studentPayrollTax = calculatePayrollTax(studentEarnedIncome);
  const studentTaxAllowance = Math.max(0, studentFederalTaxPaid);
  const studentAllowances = studentTaxAllowance + studentPayrollTax + STUDENT_INCOME_PROTECTION_ALLOWANCE;
  const studentAvailableIncome = Math.max(0, studentTotalIncome - studentAllowances);
  const studentIncomeContribution = Math.round(studentAvailableIncome * STUDENT_INCOME_ASSESSMENT_RATE);

  result.steps.studentIncome = {
    agi: studentAGI,
    federalTaxPaid: studentTaxAllowance,
    payrollTax: studentPayrollTax,
    incomeProtectionAllowance: STUDENT_INCOME_PROTECTION_ALLOWANCE,
    totalAllowances: studentAllowances,
    availableIncome: studentAvailableIncome,
    assessmentRate: '50%',
    incomeContribution: studentIncomeContribution,
  };

  // ─── STEP 8: Student's Contribution from Assets ────────────────
  const studentAssetContribution = Math.round(Math.max(0, studentAssets) * STUDENT_ASSET_CONVERSION_RATE);

  result.steps.studentAssets = {
    totalAssets: studentAssets,
    conversionRate: '20%',
    assetContribution: studentAssetContribution,
  };

  if (studentAssets > 5000) {
    result.tips.push(`Student assets are assessed at 20% (vs 5.64% for parents). If possible, consider whether assets should be held in parent accounts instead. Your $${studentAssets.toLocaleString()} in student assets adds $${studentAssetContribution.toLocaleString()} to your SAI.`);
  }

  // ─── STEP 9: TOTAL SAI ─────────────────────────────────────────
  const rawSAI = parentContribution + studentIncomeContribution + studentAssetContribution;
  const sai = Math.max(-1500, rawSAI);

  result.steps.totalSAI = {
    parentContribution,
    studentIncomeContribution,
    studentAssetContribution,
    rawSAI,
    sai,
    note: sai === -1500 ? 'SAI floored at minimum -$1,500' : null,
  };

  result.sai = sai;
  result.automaticZero = false;

  // ─── STEP 10: Pell Grant Eligibility ───────────────────────────
  // If qualifies for max Pell via poverty threshold, override
  result.pellGrant = qualifiesForMaxPell ? MAX_PELL_GRANT_2025_26 : estimatePellGrant(sai);
  result.steps.pellGrant = {
    sai,
    maxPellGrant: MAX_PELL_GRANT_2025_26,
    minPellGrant: MIN_PELL_GRANT_2025_26,
    estimatedPell: result.pellGrant,
    eligible: result.pellGrant > 0,
    qualifiedViaIncome: qualifiesForMaxPell,
    note: qualifiesForMaxPell
      ? `Maximum Pell Grant: $${MAX_PELL_GRANT_2025_26.toLocaleString()}/year (income below poverty threshold)`
      : result.pellGrant > 0
        ? `Estimated Pell Grant: $${result.pellGrant.toLocaleString()}/year`
        : 'SAI too high for Pell Grant eligibility',
  };

  // ─── Subsidized Loan Eligibility ───────────────────────────────
  // Students with financial need (SAI < Cost of Attendance) may qualify
  result.subsidizedLoanEligible = sai < 80000; // Almost all students qualify at some school
  result.steps.subsidizedLoan = {
    eligible: true,
    maxFirstYear: 3500,
    maxSecondYear: 4500,
    maxThirdFourthYear: 5500,
    note: 'Subsidized loan eligibility depends on SAI vs. Cost of Attendance at your specific school. The government pays interest while you\'re enrolled.',
  };

  // ─── Generate Tips ─────────────────────────────────────────────
  if (parentBusinessFarmNetWorth > 0) {
    result.tips.push('Under the new SAI formula, small business and farm assets are now counted (they were excluded under the old EFC). This may increase your SAI compared to prior years.');
  }

  if (!receivedMeansTestedBenefit && totalParentIncome <= povertyThreshold * 1.1) {
    result.tips.push('Your income is close to the automatic zero SAI threshold. If your family receives any means-tested benefit (SNAP, Medicaid, SSI, TANF, WIC, free/reduced lunch), report it on the FAFSA — it could reduce your SAI to -$1,500.');
  }

  if (isTwoParentHousehold && (parent2EarnedIncome === 0 || !parent2EarnedIncome)) {
    result.tips.push('You indicated married parents but only one has earned income. The employment expense allowance only applies when both parents work.');
  }

  if (sai > 0 && sai < 10000) {
    result.tips.push('Your SAI is relatively low, which means you should qualify for significant need-based aid at most schools. Schools that "meet full demonstrated need" will cover the gap between your SAI and their Cost of Attendance.');
  }

  if (sai > 50000) {
    result.tips.push('With a higher SAI, focus on merit-based scholarships and schools known for generous merit aid rather than need-based aid. Many schools offer merit scholarships regardless of financial need.');
  }

  // Overall context
  result.context = {
    whatIsSAI: 'The Student Aid Index (SAI) is a number calculated from your FAFSA data that represents your family\'s estimated ability to pay for college. Schools use it to determine your financial aid package.',
    howSchoolsUseIt: 'Financial Need = Cost of Attendance - SAI. Schools that "meet full need" will fill this gap with grants, work-study, and loans.',
    canBeNegative: 'Unlike the old EFC, the SAI can go as low as -$1,500, which signals maximum financial need.',
    isEstimate: 'This is an estimate based on the 2025-26 federal formula. Your actual SAI may differ slightly. File the FAFSA at studentaid.gov for your official number.',
    cssProfileDiffers: 'Many private colleges also require the CSS Profile, which uses a DIFFERENT formula that may assess home equity, non-custodial parent income, and other factors not on the FAFSA.',
  };

  return result;
}

/**
 * Quick SAI estimate with minimal inputs (for casual users)
 * Uses reasonable assumptions for missing data
 */
export function quickEstimateSAI({
  householdIncome,
  parentAssets = 0,
  familySize = 4,
  studentIncome = 0,
  studentAssets = 0,
  state = 'WA',
  filingStatus = 'married',
}) {
  // Estimate tax burden from income
  const estimatedFederalTax = estimateFederalTax(householdIncome, filingStatus);
  const earnedSplit = filingStatus === 'married'
    ? { parent1: Math.round(householdIncome * 0.6), parent2: Math.round(householdIncome * 0.4) }
    : { parent1: householdIncome, parent2: 0 };

  return calculateSAI({
    parentAGI: householdIncome,
    parentFederalTaxPaid: estimatedFederalTax,
    parentUntaxedIncome: 0,
    parent1EarnedIncome: earnedSplit.parent1,
    parent2EarnedIncome: earnedSplit.parent2,
    parentCashSavingsInvestments: parentAssets,
    parentBusinessFarmNetWorth: 0,
    familySize,
    parentMaritalStatus: filingStatus,
    olderParentAge: 45,
    stateOfResidence: state,
    studentAGI: studentIncome,
    studentFederalTaxPaid: 0,
    studentEarnedIncome: studentIncome,
    studentAssets,
    receivedMeansTestedBenefit: false,
  });
}

/**
 * Rough federal tax estimate for quick calculations
 */
function estimateFederalTax(income, filingStatus) {
  if (income <= 0) return 0;

  // 2023 tax brackets (married filing jointly)
  const brackets = filingStatus === 'married'
    ? [
      { upTo: 22000, rate: 0.10 },
      { upTo: 89450, rate: 0.12 },
      { upTo: 190750, rate: 0.22 },
      { upTo: 364200, rate: 0.24 },
      { upTo: 462500, rate: 0.32 },
      { upTo: 693750, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 },
    ]
    : [ // Single / Head of household (simplified)
      { upTo: 11000, rate: 0.10 },
      { upTo: 44725, rate: 0.12 },
      { upTo: 95375, rate: 0.22 },
      { upTo: 182100, rate: 0.24 },
      { upTo: 231250, rate: 0.32 },
      { upTo: 578125, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 },
    ];

  // Standard deduction
  const standardDeduction = filingStatus === 'married' ? 27700 : 13850;
  const taxableIncome = Math.max(0, income - standardDeduction);

  let tax = 0;
  let prev = 0;
  for (const bracket of brackets) {
    if (taxableIncome <= prev) break;
    const taxable = Math.min(taxableIncome, bracket.upTo) - prev;
    tax += taxable * bracket.rate;
    prev = bracket.upTo;
  }

  return Math.round(tax);
}
