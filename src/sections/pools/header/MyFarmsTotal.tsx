import { useFarmDepositsTotal } from "sections/pools/farms/position/FarmingPosition.utils"
import { HeaderTotalData } from "./PoolsHeaderTotal"

export const MyFarmsTotal = () => {
  const total = useFarmDepositsTotal()

  return <HeaderTotalData isLoading={total.isLoading} value={total.value} />
}
