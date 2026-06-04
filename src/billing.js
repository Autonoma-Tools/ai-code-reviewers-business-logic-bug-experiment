// Billing module for the Autonoma "AI code reviewer planted-bug" experiment.
//
// Pricing spec (the requirement the code is supposed to satisfy):
//   - Starter tier:  1-9 seats   -> $10 per seat / month
//   - Team tier:     10-49 seats -> $8  per seat / month
//   - Growth tier:   50+ seats   -> $6  per seat / month   (Growth starts AT 50 seats)
//
// This file contains two DELIBERATELY PLANTED bugs. See README.md (spoiler section)
// for the full explanation. Do not "fix" them blindly — the whole point of the repo
// is to hand this code to an AI code reviewer and see which bugs it catches.

const TIERS = {
  starter: { perSeat: 10 },
  team: { perSeat: 8 },
  growth: { perSeat: 6 },
};

/**
 * Resolve the pricing tier for a given seat count.
 *
 * Spec: Growth tier starts AT 50 seats (>= 50).
 */
function resolveTier(seats) {
  if (seats < 10) {
    return "starter";
  }
  // BUG 2 (business-logic, subtle): the spec says Growth starts AT 50 seats,
  // so this should be `seats >= 50`. Using `seats > 50` means a 50-seat account
  // is billed at the Team rate ($8) instead of the Growth rate ($6).
  // It is syntactically clean and every included test passes, because no test
  // exercises the exact boundary at 50 seats.
  if (seats > 50) {
    return "growth";
  }
  return "team";
}

/**
 * Calculate the monthly charge for an account.
 *
 * @param {{ seats: number, name?: string }} user - the account/user object
 * @returns {number} monthly charge in dollars
 */
function calculateCharge(user) {
  // BUG 1 (syntactic, obvious in a diff): there is no null check on `user`
  // before dereferencing `user.seats`. Passing a null/undefined user throws
  // "Cannot read properties of null (reading 'seats')".
  const seats = user.seats;

  const tier = resolveTier(seats);
  const perSeat = TIERS[tier].perSeat;

  return seats * perSeat;
}

module.exports = { calculateCharge, resolveTier, TIERS };

// Running this file directly prints a small pricing table so readers can eyeball
// the calculation: `node src/billing.js`
if (require.main === module) {
  const samples = [1, 5, 9, 10, 25, 49, 50, 51, 100];
  console.log("Monthly charge by seat count:");
  for (const seats of samples) {
    const charge = calculateCharge({ seats, name: `acct-${seats}` });
    console.log(`  ${String(seats).padStart(3)} seats -> tier=${resolveTier(seats).padEnd(7)} $${charge}`);
  }
  console.log("\nNote: spec says Growth (=$6/seat) starts AT 50 seats.");
  console.log("Check the 50-seat row above: it is billed at the Team rate, not Growth.");
}
