import { useMemo } from "react"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { useAssetsHydraPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData.utils"

export const usePoolPositions = (pool: OmnipoolPool) => {
  const positions = useAssetsHydraPositionsData()

  const data = useMemo(
    () =>
      positions.data.filter((position) => position.id === pool.id.toString()),
    [pool.id, positions.data],
  )

  return { data, isLoading: positions.isLoading }
}
