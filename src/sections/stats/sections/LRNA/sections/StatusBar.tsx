import { useHubAssetImbalance } from "api/omnipool"
import { Burning } from "sections/stats/sections/LRNA/components/Burning/Burning"
import { Bidding } from "sections/stats/sections/LRNA/components/Bidding/Bidding"

export const StatusBar = () => {
  const imbalance = useHubAssetImbalance()

  return imbalance.data?.negative?.toPrimitive() ? <Burning /> : <Bidding />
}
