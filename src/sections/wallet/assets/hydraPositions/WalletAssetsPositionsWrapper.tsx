import { WalletAssetsHydraPositions } from "./WalletAssetsHydraPositions"
import { useOmnipoolPositionsData } from "./data/WalletAssetsHydraPositionsData.utils"
import { WalletAssetsHydraPositionsSkeleton } from "./skeleton/WalletAssetsHydraPositionsSkeleton"

export const WalletAssetsPositionsWrapper = () => {
  const positionsTable = useOmnipoolPositionsData()

  if (positionsTable.isLoading) return <WalletAssetsHydraPositionsSkeleton />

  return <WalletAssetsHydraPositions data={positionsTable.data} />
}
