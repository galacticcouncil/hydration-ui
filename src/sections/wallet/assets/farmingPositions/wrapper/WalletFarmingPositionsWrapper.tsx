import { EmptySearchState } from "sections/pools/components/EmptySearchState"
import { WalletFarmingPositionsSkeleton } from "sections/wallet/assets/farmingPositions/skeleton/WalletFarmingPositionsSkeleton"
import { WalletFarmingPositions } from "sections/wallet/assets/farmingPositions/WalletFarmingPositions"
import { useFarmingPositionsData } from "sections/wallet/assets/farmingPositions/WalletFarmingPositions.utils"
import { useWalletAssetsFilters } from "sections/wallet/assets/WalletAssets.utils"

export const WalletFarmingPositionsWrapper = () => {
  const { search } = useWalletAssetsFilters()

  const { data, isLoading } = useFarmingPositionsData({ search })

  if (isLoading) return <WalletFarmingPositionsSkeleton />

  return data.length || search.length === 0 ? (
    <WalletFarmingPositions data={data} />
  ) : (
    <EmptySearchState />
  )
}
