import { type Hex } from "viem"

// Juicer vaults, Lark 0 testnet. On redeploy, update SUBLOOP_ADDRESS,
// VAULT_DEPLOY_BLOCK, and vaultAddress in vaults.ts.
// POOL_ADDRESS, HOLLAR_ADDRESS, and PRIME_ADDRESS are mainnet-mirrored on lark.

export const SUBLOOP_ADDRESS: Hex = "0xe0983cedd797b38090e6dcde54af88aa6eb22edc"

// First vault proxy (jETH) in the Lark 0 deployment on 2026-10-09.
// Too low wastes time; too high truncates history.
export const VAULT_DEPLOY_BLOCK = 123n

export const EVM_CALL_GAS = 2_000_000n

export const POOL_ADDRESS: Hex = "0x1b02E051683b5cfaC5929C25E84adb26ECf87B38"
export const PRIME_ADDRESS: Hex = "0x000000000000000000000000000000010000002B"
export const HOLLAR_ADDRESS: Hex = "0x531a654d1696ED52e7275A8cede955E82620f99a"

export const STRATEGY = {
  id: "propeller",
} as const
