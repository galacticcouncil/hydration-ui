import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"
import { BondsPageSkeleton } from "./BondsPageSkeleton"
import { BondsPage } from "./BondsPage"

export const BondsPageWrapper = () => {
  const api = useApiPromise()

  if (!isApiLoaded(api)) {
    return <BondsPageSkeleton />
  }

  return <BondsPage />
}
