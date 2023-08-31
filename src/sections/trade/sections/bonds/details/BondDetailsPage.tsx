import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"
import { BondDetailsSkeleton } from "./BondDetailsSkeleton"
import { BondDetailsData } from "./BondDetailsData"

export const BondDetailsPage = () => {
  const api = useApiPromise()

  if (!isApiLoaded(api)) return <BondDetailsSkeleton />

  return <BondDetailsData />
}
