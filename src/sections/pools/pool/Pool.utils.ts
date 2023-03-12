import { useMemo } from "react"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { useHydraPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData.utils"

export const usePoolPositions = (pool: OmnipoolPool) => {
  const positions = useHydraPositionsData()

  const data = useMemo(
    () =>
      positions.data.filter(
        (position) => position.assetId === pool.id.toString(),
      ),
    [pool.id, positions.data],
  )

  return { data, isLoading: positions.isLoading, refetch: positions.refetch }
}

export type Positions = ReturnType<typeof usePoolPositions>
