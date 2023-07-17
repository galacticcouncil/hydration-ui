import { useHubAssetImbalance } from "api/omnipool"
import { useApiPromise } from "utils/api"
import { Burning } from "../components/Burning/Burning"
import { Bidding } from "../components/Bidding/Bidding"

export const StatusBar = () => {
  const api = useApiPromise()
  const imbalance = useHubAssetImbalance(api)

  return (
    <>{imbalance.data?.negative?.toPrimitive() ? <Burning /> : <Bidding />}</>
  )
}
