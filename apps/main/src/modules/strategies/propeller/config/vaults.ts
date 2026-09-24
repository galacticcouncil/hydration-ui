import { type Hex } from "viem"

export interface PropellerVaultConfig {
  assetId: string
  vaultAddress: Hex
  shareSymbol: string
}

export const PROPELLER_VAULTS: PropellerVaultConfig[] = [
  {
    assetId: "34",
    vaultAddress: "0x3645E7013C00d91D9E6c3EA3847E586967d8fc67",
    shareSymbol: "pETH",
  },
  {
    assetId: "1000765",
    vaultAddress: "0x22fff20f7f4a7047f6975248aeafc2f013ae76cf",
    shareSymbol: "ptBTC",
  },
]

export const PROPELLER_RISK_PROFILE = "low"
