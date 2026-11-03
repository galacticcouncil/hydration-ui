import { type Hex } from "viem"

// Juicer vaults: jETH on Lark 0 (2026-11-03), jBTC on Lark 4 (reset 2026-10-30).
// The deployment follows the selected RPC; switching to another chain reloads
// the page, so it is read once here. On redeploy, update SUBLOOP_ADDRESS,
// VAULT_DEPLOY_BLOCK, and vaultAddress in vaults.ts.
// POOL_ADDRESS, HOLLAR_ADDRESS, and PRIME_ADDRESS are mainnet-mirrored on lark.
// Reads the provider store's persisted key raw, so pure logic and
// tests don't pull in the store and its env validation
export const IS_LARK_4 = (
  globalThis.localStorage?.getItem("rpcUrl") ??
  import.meta.env?.VITE_PROVIDER_URL ??
  ""
).includes("node4.lark.hydration.cloud")

export const SUBLOOP_ADDRESS: Hex = IS_LARK_4
  ? "0xe0983cedd797b38090e6dcde54af88aa6eb22edc"
  : "0x40cca3da6cead6dada9e9ffc4c06e9039791876a"

// The deployment's only vault proxy (jBTC on Lark 4, jETH on Lark 0).
// Too low wastes time; too high truncates history.
export const VAULT_DEPLOY_BLOCK = IS_LARK_4 ? 2411n : 244n

export const EVM_CALL_GAS = 2_000_000n
// a deposit uses ~1.55M gas
export const DEPOSIT_MIN_GAS = 1_700_000n
// a swap deposit buys this far under its sell quote; the rest stays in the wallet
export const DEPOSIT_SWAP_BUFFER_BPS = 30n

export const POOL_ADDRESS: Hex = "0x1b02E051683b5cfaC5929C25E84adb26ECf87B38"
export const PRIME_ADDRESS: Hex = "0x000000000000000000000000000000010000002B"
export const HOLLAR_ADDRESS: Hex = "0x531a654d1696ED52e7275A8cede955E82620f99a"

export const STRATEGY = {
  id: "juicer",
} as const
