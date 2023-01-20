import { WalletAssetsHydraPositions } from "./WalletAssetsHydraPositions"
import { useHydraPositionsData } from "./data/WalletAssetsHydraPositionsData.utils"
import { WalletAssetsHydraPositionsSkeleton } from "./skeleton/WalletAssetsHydraPositionsSkeleton"

export const WalletAssetsPositionsWrapper = () => {
  const positionsTable = useHydraPositionsData()

  if (positionsTable.isLoading) return <WalletAssetsHydraPositionsSkeleton />

  return <WalletAssetsHydraPositions data={positionsTable.data} />
}
