import { useMemo } from "react"
import { useAllUserDepositShare } from "sections/pools/farms/position/FarmingPosition.utils"
import { HeaderTotalData } from "./PoolsHeaderTotal"
import { BN_0 } from "utils/constants"

export const MyFarmsTotal = () => {
  const miningPositions = useAllUserDepositShare()

  const totalFarms = useMemo(() => {
    let calculatedShares = BN_0
    for (const poolId in miningPositions.data) {
      const poolTotal = miningPositions.data[poolId].reduce((memo, share) => {
        return memo.plus(share.valueDisplay)
      }, BN_0)
      calculatedShares = calculatedShares.plus(poolTotal)
    }
    return calculatedShares
  }, [miningPositions.data])

  return (
    <HeaderTotalData isLoading={miningPositions.isLoading} value={totalFarms} />
  )
}
