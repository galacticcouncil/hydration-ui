import { PoolChart } from "@/modules/liquidity/components/PoolDetailsChart/PoolDetailsChart"
import { VaultTable } from "@/modules/liquidity/Vaults.utils"

export const VaultPriceChart = ({ vault }: { vault: VaultTable }) => {
  const [token0] = vault.tokens

  return <PoolChart assetId={token0.id} height={420} />
}
