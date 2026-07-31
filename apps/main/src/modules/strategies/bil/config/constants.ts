import { type Hex } from "viem"

// BIL Vault — addresses from aave-v3-deploy/deployments/bil/_addresses.md.
// Surface: ERC-4626 (deposit/mint) + ERC-7540 (async redeem).
export const VAULT_ADDRESS: Hex = "0x7a1FFcF0949C6cf85d16BA04221D650Db0dE41A5"
export const HOLLAR_ADDRESS: Hex = "0x531a654d1696ED52e7275A8cede955E82620f99a"

// BIL Aave V3 money-market layer. The Aave pool, deposit-zap, and aToken
// below power the borrow / supply / instant-redeem flows.
//
// Aave layer endpoints:
//   - Supply BIL  → pool.supply(DCL_PRECOMPILE, ..., user, 0)
//   - Borrow HOLLAR → pool.borrow(HOLLAR, ..., 2, 0, user)
//   - Zap deposit (HOLLAR → vault → pool.supply) → zap.depositAndSupply
//   - Instant redeem path uses the BIL/HOLLAR stableswap (id 10055).
export const BIL_POOL_ADDRESS: Hex =
  "0xd10b84Ee54dc5B81366b56bABBF4D32303629835"
export const BIL_DEPOSIT_ZAP_ADDRESS: Hex =
  "0xFF14a4Bf1Fe038D23b68d738B81cF900FD6E9D8B"
export const BIL_ATOKEN_ADDRESS: Hex =
  "0xCc7Dc2433073ed4cf1daFd1A1b9c32e193cce5ce"

// Substrate asset 550 (0x226) — the underlying reserve registered in the pool.
export const DCL_PRECOMPILE_ADDRESS: Hex =
  "0x0000000000000000000000000000000100000226"

// Aave V3 interestRateMode for borrows: 2 = variable (GhoAToken path).
export const AAVE_INTEREST_RATE_MODE_VARIABLE = 2n

// Gas limit for every EVM call the strategy wraps into a substrate batch.
export const EVM_CALL_GAS = 2_000_000n
