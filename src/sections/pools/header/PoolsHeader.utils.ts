import { usePools } from "api/pools"
import { useTotalLiquidities } from "api/totalLiquidity"

export function useTotals() {
  const pools = usePools()
  const totalLiquidities = useTotalLiquidities(
    pools?.data?.map((pool) => pool.id) ?? [],
  )

  const queries = [pools, totalLiquidities]
  const isLoading = queries.some((q) => q.isLoading)

  return { isLoading, totalLiquidity: totalLiquidities.data }
}
