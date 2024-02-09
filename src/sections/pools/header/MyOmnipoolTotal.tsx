import { useMemo } from "react"
import { useOmnipoolPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData.utils"
import { BN_0 } from "utils/constants"
import { HeaderTotalData } from "./PoolsHeaderTotal"

export const MyOmnipoolTotal = () => {
  const omnipoolPositions = useOmnipoolPositionsData()

  const totalOmnipool = useMemo(() => {
    return omnipoolPositions.data.reduce((acc, position) => {
      return acc.plus(position.valueDisplay)
    }, BN_0)
  }, [omnipoolPositions.data])

  return (
    <HeaderTotalData
      isLoading={omnipoolPositions.isInitialLoading}
      value={totalOmnipool}
    />
  )
}
