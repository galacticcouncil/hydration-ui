import { useMemo } from "react"
import { useOmnipoolPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData.utils"
import { BN_0 } from "utils/constants"
import { HeaderTotalData } from "./PoolsHeaderTotal"
import { useAllOmnipoolDeposits } from "sections/pools/farms/position/FarmingPosition.utils"

export const MyOmnipoolTotal = () => {
  const omnipoolPositions = useOmnipoolPositionsData()
  const omnipoolDeposits = useAllOmnipoolDeposits()

  const totalOmnipoolInFarms = useMemo(() => {
    let poolsTotal = BN_0

    for (const poolId in omnipoolDeposits) {
      const poolTotal = omnipoolDeposits[poolId].reduce((memo, share) => {
        return memo.plus(share.valueDisplay)
      }, BN_0)
      poolsTotal = poolsTotal.plus(poolTotal)
    }

    return poolsTotal.toString()
  }, [omnipoolDeposits])

  const totalOmnipool = useMemo(() => {
    return omnipoolPositions.data.reduce((acc, position) => {
      return acc.plus(position.valueDisplay)
    }, BN_0)
  }, [omnipoolPositions.data])

  return (
    <HeaderTotalData
      isLoading={omnipoolPositions.isInitialLoading}
      value={totalOmnipool.plus(totalOmnipoolInFarms)}
      fontSize={19}
    />
  )
}
