# Where Aave's fixtures and the contracts disagree, the contracts win

ADR-0006 normalized v2's ray/wad rounding to truncation, matching Solidity
rather than replicating the blueprint's own inconsistency. That leaves a gap it
named but did not fill: some of Aave's JS test fixtures encode BigNumber.js
behaviour we deliberately rejected, so they can no longer serve as the
definition of correct.

**The deployed Hydration pool is the arbiter.** Where a ported function's output
diverges from upstream's expected value, the correct value is read off the
contracts, recorded as a fixture, and committed. Aave's own fixtures are kept
wherever they agree — they are genuinely independent, not tautological
(`pool-math.test.ts` values are real chain data at a named block with balances
computed in hardhat), and re-deriving them would be wasted work.

The same rule fills the other gap #3 found: six reachable functions have no
upstream test at all, `formatReservesAndIncentives` and `normalizedToUsd` among
them. Their fixtures come from the chain too, not from hand-derivation, which
would risk being worked the same way the implementation is and so pass by
construction.

## Consequences

A fixture that disagrees with Aave's is **not automatically a bug in the port**,
and a fixture that agrees is not automatically right. Each divergence is
classified deliberately — against the contract, not against the library — and
the classification is recorded with the fixture. Adjusting an expected value to
make a suite go green, without that step, is the failure mode this ADR exists to
prevent.

Recorded chain payloads are committed, so no test reaches the network.
