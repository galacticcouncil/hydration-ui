// RAILGUN deployment addresses on Hydration networks.
// Phase 0 (lark node4, 2026-05-13): RAILGUN V2 no-governance deploy with 0% protocol fees.
// Phase 1 (mainnet): TBD — addresses will land here when Phase 1 runs.

export type RailgunChainConfig = {
  chainId: number
  rpcUrl: string
  wsUrl: string
  proxy: `0x${string}`
  relayAdapt: `0x${string}`
  delegator: `0x${string}`
  deploymentBlock: number
  label: string
}

export const RAILGUN_LARK: RailgunChainConfig = {
  chainId: 222222,
  rpcUrl: "https://node4.lark.hydration.cloud",
  wsUrl: "wss://node4.lark.hydration.cloud",
  proxy: "0x195C5EFAa658Ac3C40DF6138F1C3B948Ed2C83D7",
  relayAdapt: "0x273280a6248BFEC57bc7ef2A16E70AEBe065D737",
  delegator: "0xfa456bAF41daB0051E50D0a3a5aF3eFD3431cA2f",
  deploymentBlock: 244000,
  label: "Hydration lark node4 (Phase 0)",
}

// Default config used by the Privacy module. Switches when mainnet lands.
export const ACTIVE_RAILGUN_CHAIN: RailgunChainConfig = RAILGUN_LARK
