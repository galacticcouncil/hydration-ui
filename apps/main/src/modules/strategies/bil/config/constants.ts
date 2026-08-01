import { type Hex } from "viem"

// BIL Vault — addresses from money-market/deployments/bil/_addresses.md.
// Surface: ERC-4626 (deposit/mint) + ERC-7540 (async redeem).
export const VAULT_ADDRESS: Hex = "0x6a21891Db0940491603f3ccA0a9f4DBA4c6E810C"
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
  "0x69310FdA58c819aD82df7d2Cb61841C853337a53"
export const BIL_DEPOSIT_ZAP_ADDRESS: Hex =
  "0x646FD203bbCf19B35D79F58413bB07450FDBb1db"
export const BIL_ATOKEN_ADDRESS: Hex =
  "0x8184E2F7c477d165772c21f7A2DBBb61A76E7Fc4"

// Substrate asset 550 (0x226) — the underlying reserve registered in the pool.
export const DCL_PRECOMPILE_ADDRESS: Hex =
  "0x0000000000000000000000000000000100000226"

// Aave V3 interestRateMode for borrows: 2 = variable (GhoAToken path).
export const AAVE_INTEREST_RATE_MODE_VARIABLE = 2n

// Gas limit for every EVM call the strategy wraps into a substrate batch.
export const EVM_CALL_GAS = 2_000_000n
