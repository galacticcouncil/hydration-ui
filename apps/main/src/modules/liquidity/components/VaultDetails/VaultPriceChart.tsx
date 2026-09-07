import { PoolChart } from "@/modules/liquidity/components/PoolDetailsChart/PoolDetailsChart"
import { VaultTable } from "@/modules/liquidity/Vaults.utils"

/** token0 against the display stablecoin, same feed as an omnipool asset page */
export const VaultPriceChart = ({ vault }: { vault: VaultTable }) => {
  const [token0] = vault.tokens

  return <PoolChart assetId={token0.id} height={420} />
}
