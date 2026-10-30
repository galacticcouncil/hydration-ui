import { type Hex } from "viem"

// Juicer vaults, Lark 4 testnet (reset 2026-10-30). On redeploy, update SUBLOOP_ADDRESS,
// VAULT_DEPLOY_BLOCK, and vaultAddress in vaults.ts.
// POOL_ADDRESS, HOLLAR_ADDRESS, and PRIME_ADDRESS are mainnet-mirrored on lark.

export const SUBLOOP_ADDRESS: Hex = "0xe0983cedd797b38090e6dcde54af88aa6eb22edc"

// The jBTC vault proxy, the only vault in the Lark 4 deployment on 2026-10-30.
// Too low wastes time; too high truncates history.
export const VAULT_DEPLOY_BLOCK = 2411n

export const EVM_CALL_GAS = 2_000_000n
// a deposit uses ~1.55M gas
export const DEPOSIT_MIN_GAS = 1_700_000n
// a swap deposit buys this far under its sell quote; the rest stays in the wallet
export const DEPOSIT_SWAP_BUFFER_BPS = 30n

export const POOL_ADDRESS: Hex = "0x1b02E051683b5cfaC5929C25E84adb26ECf87B38"
export const PRIME_ADDRESS: Hex = "0x000000000000000000000000000000010000002B"
export const HOLLAR_ADDRESS: Hex = "0x531a654d1696ED52e7275A8cede955E82620f99a"

export const STRATEGY = {
  id: "propeller",
} as const
