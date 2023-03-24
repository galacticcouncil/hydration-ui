import { WalletFarmingPositionsSkeleton } from "../skeleton/WalletFarmingPositionsSkeleton"
import { WalletFarmingPositions } from "../WalletFarmingPositions"
import { useFarmingPositionsData } from "../WalletFarmingPositions.utils"

export const WalletFarmingPositionsWrapper = () => {
  const { data, isLoading } = useFarmingPositionsData()

  if (isLoading) return <WalletFarmingPositionsSkeleton />

  return <WalletFarmingPositions data={data} />
}
