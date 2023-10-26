import { WalletAssetsHydraPositions } from "./WalletAssetsHydraPositions"
import { useHydraPositionsData } from "./data/WalletAssetsHydraPositionsData.utils"
import { WalletAssetsHydraPositionsSkeleton } from "./skeleton/WalletAssetsHydraPositionsSkeleton"
import { useWalletAssetsFilters } from "sections/wallet/assets/WalletAssets.utils"

export const WalletAssetsPositionsWrapper = () => {
  const { search } = useWalletAssetsFilters()

  const positionsTable = useHydraPositionsData({ search })

  if (positionsTable.isLoading) return <WalletAssetsHydraPositionsSkeleton />

  return <WalletAssetsHydraPositions data={positionsTable.data} />
}
