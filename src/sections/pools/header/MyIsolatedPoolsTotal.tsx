import BigNumber from "bignumber.js"
import { HeaderTotalData } from "./PoolsHeaderTotal"
import { useAllXYKDeposits } from "sections/pools/farms/position/FarmingPosition.utils"
import { BN_0 } from "utils/constants"
import { useMemo } from "react"

export const MyIsolatedPoolsTotal = ({
  value,
  isLoading,
}: {
  value: string
  isLoading: boolean
}) => {
  const xykDeposits = useAllXYKDeposits()

  const totalInFarms = useMemo(() => {
    let poolsTotal = BN_0

    for (const poolId in xykDeposits.data) {
      const poolTotal = xykDeposits.data[poolId].reduce((memo, deposit) => {
        return memo.plus(deposit.amountUSD)
      }, BN_0)
      poolsTotal = poolsTotal.plus(poolTotal)
    }

    return poolsTotal.toString()
  }, [xykDeposits])

  return (
    <HeaderTotalData
      isLoading={isLoading || xykDeposits.isLoading}
      value={BigNumber(value).plus(totalInFarms)}
      fontSize={19}
    />
  )
}
