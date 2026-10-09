import { type Hex } from "viem"

export interface PropellerVaultConfig {
  assetId: string
  vaultAddress: Hex
  shareSymbol: string
}

export const PROPELLER_VAULTS: PropellerVaultConfig[] = [
  {
    assetId: "34",
    vaultAddress: "0x3a1c0fa2f877c84d2930e59637c111a31878dcdf",
    shareSymbol: "jETH",
  },
  {
    assetId: "1000765",
    vaultAddress: "0x7b200b8c8a5ffd7720a48b0cb5a7f9fc6a512578",
    shareSymbol: "jtBTC",
  },
]

export const PROPELLER_RISK_PROFILE = "low"
