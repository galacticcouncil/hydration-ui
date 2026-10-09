import { type Hex } from "viem"

export interface PropellerVaultConfig {
  assetId: string
  vaultAddress: Hex
  shareSymbol: string
}

export const PROPELLER_VAULTS: PropellerVaultConfig[] = [
  {
    assetId: "34",
    vaultAddress: "0x79b41c78a2b5ac1ddc3c80877449b1cc8f850c46",
    shareSymbol: "jETH",
  },
  {
    assetId: "1000765",
    vaultAddress: "0x2c66100c46d15d6b826ba2a89f2d31e3ca47a153",
    shareSymbol: "jtBTC",
  },
]

export const PROPELLER_RISK_PROFILE = "low"
