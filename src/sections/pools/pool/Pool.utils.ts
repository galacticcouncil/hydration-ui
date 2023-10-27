import { useMemo } from "react"
import { useOmnipoolPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData.utils"

export const usePoolPositions = (poolId: string) => {
  const positions = useOmnipoolPositionsData()

  const data = useMemo(
    () =>
      positions.data.filter(
        (position) => position.assetId === poolId.toString(),
      ),
    [poolId, positions.data],
  )

  return { data, isLoading: positions.isLoading }
}

export type Positions = ReturnType<typeof usePoolPositions>
