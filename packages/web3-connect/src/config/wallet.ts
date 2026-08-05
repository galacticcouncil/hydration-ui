export const WALLET_DAPP_NAME = "Hydration"

export const REOWN_PROJECT_ID = "265a3fea03b46c14a46a201fbd6c552e"

export enum WalletProviderStatus {
  Connected = "connected",
  Pending = "pending",
  Disconnected = "disconnected",
  Error = "error",
}

export enum WalletMode {
  Default = "default",
  EVM = "evm",
  Substrate = "substrate",
  SubstrateEVM = "substrate-evm",
  SubstrateH160 = "substrate-h160",
  Solana = "solana",
  Sui = "sui",
  Unknown = "unknown",
}

// ponytail: Near/Zcash modes belong to the xchain-swap scope (Non-Goal) and are
// not ported here. Add them (plus NearAddr/ZcashAddr in @galacticcouncil/utils)
// only if cross-chain wallet support lands.
export const WALLET_ACCOUNT_FILTER_OPTIONS = [
  WalletMode.Substrate,
  WalletMode.SubstrateH160,
  WalletMode.EVM,
  WalletMode.Solana,
  WalletMode.Sui,
] as const satisfies Array<WalletMode>

export type WalletAccountFilterOptionOverride =
  (typeof WALLET_ACCOUNT_FILTER_OPTIONS)[number]

export type WalletAccountFilterOption =
  | WalletAccountFilterOptionOverride
  | WalletMode.Default
