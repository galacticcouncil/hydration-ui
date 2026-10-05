import { type Hex } from "viem"

export interface PropellerVaultConfig {
  assetId: string
  vaultAddress: Hex
  shareSymbol: string
}

export const PROPELLER_VAULTS: PropellerVaultConfig[] = [
  {
    assetId: "34",
    vaultAddress: "0x40cca3da6cead6dada9e9ffc4c06e9039791876a",
    shareSymbol: "pETH",
  },
  {
    assetId: "1000765",
    vaultAddress: "0x5b153c8e24ca62436ef836a1f179dd8ade2d5acd",
    shareSymbol: "ptBTC",
  },
]

export const PROPELLER_RISK_PROFILE = "low"
