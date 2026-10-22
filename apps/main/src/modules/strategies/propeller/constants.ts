import { type Hex } from "viem"

// Juicer vaults, Lark 0 testnet (2026-10-22). On redeploy, update SUBLOOP_ADDRESS,
// VAULT_DEPLOY_BLOCK, and vaultAddress in vaults.ts.
// POOL_ADDRESS, HOLLAR_ADDRESS, and PRIME_ADDRESS are mainnet-mirrored on lark.

export const SUBLOOP_ADDRESS: Hex = "0x5f8d1d70c658fd0ffd79d3eaa692fc78306f39db"

// First vault proxy (jETH) in the Lark 0 deployment on 2026-10-22.
// Too low wastes time; too high truncates history.
export const VAULT_DEPLOY_BLOCK = 59n

// mainnet and the lark forks run 2s blocks (since 2026-09-03)
export const BLOCK_TIME_SECONDS = 2

export const EVM_CALL_GAS = 2_000_000n
// a deposit uses ~1.55M gas
export const DEPOSIT_MIN_GAS = 1_700_000n

export const POOL_ADDRESS: Hex = "0x1b02E051683b5cfaC5929C25E84adb26ECf87B38"
export const PRIME_ADDRESS: Hex = "0x000000000000000000000000000000010000002B"
export const HOLLAR_ADDRESS: Hex = "0x531a654d1696ED52e7275A8cede955E82620f99a"

export const STRATEGY = {
  id: "propeller",
} as const
