import { useFarmDepositsTotal } from "sections/pools/farms/position/FarmingPosition.utils"
import { HeaderTotalData } from "./PoolsHeaderTotal"
import BigNumber from "bignumber.js"

export const MyFarmsTotal = () => {
  const total = useFarmDepositsTotal()

  return (
    <HeaderTotalData
      isLoading={total.isLoading}
      value={BigNumber(total.value)}
    />
  )
}
