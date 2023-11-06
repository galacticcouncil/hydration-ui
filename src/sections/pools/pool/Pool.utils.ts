import { useMemo } from "react"
import { useHydraPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData.utils"
import { u32 } from "@polkadot/types-codec"

export const usePoolPositions = (poolId: u32) => {
  const positions = useHydraPositionsData()

  const data = useMemo(
    () =>
      positions.data.filter(
        (position) => position.assetId === poolId.toString(),
      ),
    [poolId, positions.data],
  )

  return { data, isLoading: positions.isLoading, refetch: positions.refetch }
}

export type Positions = ReturnType<typeof usePoolPositions>
