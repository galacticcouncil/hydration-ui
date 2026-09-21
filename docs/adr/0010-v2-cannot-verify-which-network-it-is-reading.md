# v2 cannot verify which network it is reading, and does not try

A future reader will ask why `money-market-v2` never checks that it is talking
to the network it thinks it is. The answer is that no honest EVM-level check
exists, and this was established by probing the chains rather than assumed.

Hydration mainnet and testnet are genuinely different chains — their Substrate
genesis hashes differ — but from the EVM side they are indistinguishable:

- `eth_chainId` returns `0x3640e` (222222) on **both**. This is why
  `ChainId.hydration_testnet = 333333` was fabricated in v1; the comment at
  `networksConfig.ts:3` undersells it as a convenience when it is a workaround
  for a real collision.
- `eth_getBlockByNumber("0x0")` returns **null on mainnet** and a hash on
  testnet, so there is nothing to compare.
- The Aave contracts sit at the **same addresses on both chains** (ADR from #15:
  v1's separate testnet addresses are dead; the testnet deployment moved to
  mainnet's addresses), so probing a contract proves nothing either.

Only `chain_getBlockHash(0)` separates them, and that is a Substrate method. v2
is an EVM-only module with no papi dependency (#6, #12), and reaching for a
Substrate call purely to self-verify would trade a real architectural property
for a defensive check.

So: **the pairing of transport and market descriptor is structural, not
verified.** `/react`'s provider holds the wagmi `Config` and the descriptor
together (#10), so the pairing is made once. That is the guarantee.

## Consequences

Code using the pure core directly pairs them itself, and **a mismatch is silent
— no error, just numbers from the wrong network.** This is the single sharpest
edge in v2's interface.

If that ever proves to bite in practice, the fix is not a runtime probe. It is
to stop passing transport and descriptor as independent per-call arguments and
make the pair the only way to name a market.
