import { WalletAssetsHydraPositions } from "./WalletAssetsHydraPositions"
import { useOmnipoolPositionsData } from "./data/WalletAssetsHydraPositionsData.utils"
import { WalletAssetsHydraPositionsSkeleton } from "./skeleton/WalletAssetsHydraPositionsSkeleton"
import { useWalletAssetsFilters } from "sections/wallet/assets/WalletAssets.utils"

export const WalletAssetsPositionsWrapper = () => {
  const { search } = useWalletAssetsFilters()

  const positionsTable = useOmnipoolPositionsData({ search })

  if (positionsTable.isLoading) return <WalletAssetsHydraPositionsSkeleton />

  return <WalletAssetsHydraPositions data={positionsTable.data} />
}
