import { HeaderTotalData } from "./PoolsHeaderTotal"
import { useStablepoolsTotals } from "sections/pools/PoolsPage.utils"
import BN from "bignumber.js"

export const StablePoolsTotal = () => {
  const { isLoading, tvl } = useStablepoolsTotals()

  return (
    <HeaderTotalData
      isLoading={isLoading}
      value={BN(tvl)}
      fontSize={[19, 24]}
    />
  )
}
