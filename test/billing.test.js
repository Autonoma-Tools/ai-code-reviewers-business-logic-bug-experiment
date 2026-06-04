// Plain Node.js test file — no framework dependencies. Node 18+ only.
// Run with: `node test/billing.test.js`
//
// Every test here PASSES, even though src/billing.js contains a business-logic
// bug. That is the whole point: a green test suite does not prove the spec is met.
// The tests below check seat counts on either side of the Growth boundary (49 and 51)
// but never the exact boundary at 50, which is where the planted bug hides.

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { calculateCharge, resolveTier } = require("../src/billing.js");

test("starter tier: 1 seat is billed at $10/seat", () => {
  assert.equal(resolveTier(1), "starter");
  assert.equal(calculateCharge({ seats: 1 }), 10);
});

test("starter tier: 9 seats is billed at $10/seat", () => {
  assert.equal(resolveTier(9), "starter");
  assert.equal(calculateCharge({ seats: 9 }), 90);
});

test("team tier: 10 seats is billed at $8/seat", () => {
  assert.equal(resolveTier(10), "team");
  assert.equal(calculateCharge({ seats: 10 }), 80);
});

test("team tier: 25 seats is billed at $8/seat", () => {
  assert.equal(resolveTier(25), "team");
  assert.equal(calculateCharge({ seats: 25 }), 200);
});

test("team tier: 49 seats (just below Growth) is billed at $8/seat", () => {
  assert.equal(resolveTier(49), "team");
  assert.equal(calculateCharge({ seats: 49 }), 392);
});

test("growth tier: 51 seats (just above Growth boundary) is billed at $6/seat", () => {
  assert.equal(resolveTier(51), "growth");
  assert.equal(calculateCharge({ seats: 51 }), 306);
});

test("growth tier: 100 seats is billed at $6/seat", () => {
  assert.equal(resolveTier(100), "growth");
  assert.equal(calculateCharge({ seats: 100 }), 600);
});

// NOTE: there is intentionally NO test for exactly 50 seats. Per the pricing spec,
// 50 seats should resolve to the Growth tier ($6/seat = $300). Add the assertion
// below and run the suite to watch it FAIL against the planted bug:
//
//   test("growth tier: 50 seats is the Growth boundary", () => {
//     assert.equal(resolveTier(50), "growth");        // currently returns "team"
//     assert.equal(calculateCharge({ seats: 50 }), 300); // currently returns 400
//   });
