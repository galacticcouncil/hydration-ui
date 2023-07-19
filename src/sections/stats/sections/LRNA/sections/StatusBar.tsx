import { useHubAssetImbalance } from "api/omnipool"
import { Burning } from "../components/Burning/Burning"
import { Bidding } from "../components/Bidding/Bidding"

export const StatusBar = () => {
  const imbalance = useHubAssetImbalance()

  return imbalance.data?.negative?.toPrimitive() ? <Burning /> : <Bidding />
}
