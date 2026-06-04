# The Business Logic Bug 5 AI Code Reviewers All Missed

A billing module with two deliberately planted bugs, one syntactic (null dereference) and one business-logic (billing tier off-by-one at 50 seats), so readers can reproduce the AI code reviewer experiment themselves.

> Companion code for the Autonoma blog post: **[The Business Logic Bug 5 AI Code Reviewers All Missed](https://www.getautonoma.com/blog/ai-code-reviewers-business-logic-bug-experiment)**

## What this repo is for

The linked blog post describes an experiment: take a small, realistic billing module, plant two bugs in it, and hand the diff to five different AI code reviewers. One bug is the kind any linter or reviewer catches. The other is a quiet business-logic error that every reviewer waved through.

This repo lets you reproduce that experiment yourself. The code runs, the test suite is green, and yet one of the bugs is still live. Run your own preferred AI code reviewer against it and see which bugs it flags.

## The pricing specification

The module in `src/billing.js` is supposed to implement this seat-based pricing:

<table>
<thead>
<tr><th>Tier</th><th>Seat range</th><th>Price per seat / month</th></tr>
</thead>
<tbody>
<tr><td>Starter</td><td>1 to 9 seats</td><td>$10</td></tr>
<tr><td>Team</td><td>10 to 49 seats</td><td>$8</td></tr>
<tr><td>Growth</td><td>50 seats and up</td><td>$6</td></tr>
</tbody>
</table>

The key line of the spec, the one the code violates: **the Growth tier starts AT 50 seats.** A 50-seat account should be billed as Growth ($6/seat = $300/month), not Team.

## Requirements

Node 18 or newer. No third-party dependencies, no install step.

## Quickstart

```bash
git clone https://github.com/Autonoma-Tools/ai-code-reviewers-business-logic-bug-experiment.git
cd ai-code-reviewers-business-logic-bug-experiment

# 1. See the pricing calculation for a range of seat counts
node src/billing.js

# 2. Run the test suite. Every test passes.
node test/billing.test.js

# 3. Now verify by hand that a 50-seat account is billed at the WRONG tier
node examples/verify-50-seat-bug.js
```

You will watch the test suite go fully green, and then watch the manual check at exactly 50 seats reveal that the account is billed at the Team rate ($400) instead of the Growth rate it is owed ($300). That gap is the planted business-logic bug.

## Reproduce the experiment

1. Fork this repo.
2. Open the planted code as a pull request against your fork (or review the current `main` directly).
3. Point your preferred AI code reviewer at it: GitHub Copilot, CodeRabbit, a custom GPT/Claude reviewer, whatever you use day to day.
4. See which of the two bugs it catches. The null dereference is the easy one. The 50-seat boundary is the one that hides in plain sight.

If you want a fresh diff to review, revert `src/billing.js` to a correct version, then re-introduce the two changes as a single commit and open that as the PR.

## Project structure

```
.
├── LICENSE
├── README.md
├── package.json
├── src/
│   └── billing.js                  # the billing module (contains both planted bugs)
├── test/
│   └── billing.test.js             # plain node:test suite, no deps, all green
└── examples/
    └── verify-50-seat-bug.js       # end-to-end proof the 50-seat account is mispriced
```

- `src/` — the billing module referenced in the blog post.
- `test/` — a dependency-free `node:test` suite that passes despite the live bug.
- `examples/` — a runnable script that demonstrates the bug end to end.

## About

This repository is maintained by [Autonoma](https://getautonoma.com) as reference material for the linked blog post. Autonoma builds autonomous AI agents that plan, execute, and maintain end-to-end tests directly from your codebase.

If something here is wrong, out of date, or unclear, please [open an issue](https://github.com/Autonoma-Tools/ai-code-reviewers-business-logic-bug-experiment/issues/new).

## License

Released under the [MIT License](./LICENSE) © 2026 Autonoma Labs.

---

<details>
<summary><strong>Spoilers: the two planted bugs (try your own AI reviewer first)</strong></summary>

Both bugs in `src/billing.js` are **intentional**. Do not "fix" them and call it a day, the point of the repo is to keep them present so you can test code reviewers against them.

**Bug 1 — syntactic, obvious in a diff (null dereference).**
`calculateCharge(user)` reads `user.seats` with no null check on `user`. Passing a null or undefined user throws `Cannot read properties of null (reading 'seats')`. Almost every reviewer (and most linters) catch this immediately.

**Bug 2 — business-logic, subtle (boundary off-by-one).**
`resolveTier(seats)` uses `seats > 50` to enter the Growth tier. The spec says Growth starts *at* 50 seats, so it should be `seats >= 50`. The result: a 50-seat account is charged the Team rate ($8/seat = $400) instead of the Growth rate it is owed ($6/seat = $300).

The code is syntactically clean, and the included test suite is fully green, because the tests check 49 seats (Team) and 51 seats (Growth) but never the exact boundary at 50. Add a test for 50 seats (the commented-out block at the bottom of `test/billing.test.js`) and it will fail, exposing the bug. This is the bug the AI reviewers in the blog post missed.

</details>
