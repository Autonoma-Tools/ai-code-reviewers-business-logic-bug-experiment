// End-to-end demonstration of the planted business-logic bug.
// Run with: `node examples/verify-50-seat-bug.js`
//
// The pricing spec says the Growth tier ($6/seat) starts AT 50 seats. A 50-seat
// account should therefore be charged 50 * $6 = $300. Because of the boundary
// off-by-one in src/billing.js (`seats > 50` instead of `seats >= 50`), the
// account is billed at the Team rate of $8/seat = $400 instead.

const { calculateCharge, resolveTier } = require("../src/billing.js");

const SEATS = 50;
const EXPECTED_TIER = "growth";
const EXPECTED_CHARGE = 300; // 50 seats * $6/seat per the spec

const actualTier = resolveTier(SEATS);
const actualCharge = calculateCharge({ seats: SEATS, name: "boundary-account" });

console.log(`Account with ${SEATS} seats:`);
console.log(`  expected tier:   ${EXPECTED_TIER} ($${EXPECTED_CHARGE})`);
console.log(`  actual tier:     ${actualTier} ($${actualCharge})`);

if (actualTier !== EXPECTED_TIER || actualCharge !== EXPECTED_CHARGE) {
  console.log("\n>> Bug reproduced: a 50-seat account is billed at the WRONG tier.");
  console.log(`>> The spec wants Growth ($${EXPECTED_CHARGE}); the code charges ${actualTier} ($${actualCharge}).`);
} else {
  console.log("\n>> No discrepancy — the boundary bug appears to be fixed.");
}

// Bonus: show that Bug 1 (the null dereference) throws on a null user.
console.log("\nNull-user check (Bug 1):");
try {
  calculateCharge(null);
  console.log("  No error thrown — Bug 1 appears to be fixed.");
} catch (err) {
  console.log(`  Threw as expected: ${err.message}`);
}
