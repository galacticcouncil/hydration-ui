import { WalletFarmingPositionsSkeleton } from "sections/wallet/assets/farmingPositions/skeleton/WalletFarmingPositionsSkeleton"
import { WalletFarmingPositions } from "sections/wallet/assets/farmingPositions/WalletFarmingPositions"
import { useFarmingPositionsData } from "sections/wallet/assets/farmingPositions/WalletFarmingPositions.utils"

export const WalletFarmingPositionsWrapper = () => {
  const { data, isLoading } = useFarmingPositionsData()

  if (isLoading) return <WalletFarmingPositionsSkeleton />

  return <WalletFarmingPositions data={data} />
}
