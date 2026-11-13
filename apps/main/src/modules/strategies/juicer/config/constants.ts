import { type Hex } from "viem"

// TEMPORARY (ICE deposit demo): with the Lark 0 RPC selected, the Juicer
// contracts are its deployment (jETH, 2026-11-03); anything else is mainnet.
// Switching RPC reloads the page, so it is read once. Remove before release.
// ponytail: reads the provider store's persisted key raw, so pure logic and
// tests don't pull in the store and its env validation
export const IS_LARK_0 = (
  globalThis.localStorage?.getItem("rpcUrl") ??
  import.meta.env?.VITE_PROVIDER_URL ??
  ""
).includes("node0.lark.hydration.cloud")

// On redeploy, update SUBLOOP_ADDRESS, VAULT_DEPLOY_BLOCK, and vaultAddress in
// vaults.ts. POOL_ADDRESS, HOLLAR_ADDRESS, and PRIME_ADDRESS are mainnet addresses.
export const SUBLOOP_ADDRESS: Hex = IS_LARK_0
  ? "0x40cca3da6cead6dada9e9ffc4c06e9039791876a"
  : "0x2df1d70f413b5edd16bb794791117948a7436a45"

// The vault proxy's deploy block. Too low wastes time; too high truncates history.
export const VAULT_DEPLOY_BLOCK = IS_LARK_0 ? 244n : 16_630_310n

/**
 * ICE `on_resolved` forward target that deposits an intent's output into the
 * vault. Set, swap deposits go through an ICE intent instead of Router.buy.
 * Deployed on Lark 0 only; on mainnet swap deposits stay on Router.buy.
 */
export const ICE_DEPOSIT_ADAPTER: Hex | null = IS_LARK_0
  ? "0x202df3edac2775b857ee2f61a3569731e53ec713"
  : null

export const EVM_CALL_GAS = 2_000_000n
// a swap deposit buys this far under its sell quote; the rest stays in the wallet
export const DEPOSIT_SWAP_BUFFER_BPS = 30n

export const POOL_ADDRESS: Hex = "0x1b02E051683b5cfaC5929C25E84adb26ECf87B38"
export const HOLLAR_ADDRESS: Hex = "0x531a654d1696ED52e7275A8cede955E82620f99a"
export const PRIME_ADDRESS: Hex = "0x000000000000000000000000000000010000002B"
