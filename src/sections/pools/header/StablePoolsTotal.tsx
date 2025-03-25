import { HeaderTotalData } from "./PoolsHeaderTotal"
import { useStablepoolsTotals } from "sections/pools/PoolsPage.utils"

export const StablePoolsTotal = () => {
  const { isLoading, tvl } = useStablepoolsTotals()

  return (
    <HeaderTotalData isLoading={isLoading} value={tvl} fontSize={[19, 24]} />
  )
}
