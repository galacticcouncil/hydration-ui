import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"

export const BondsPageWrapper = () => {
  const api = useApiPromise()

  if (!isApiLoaded(api)) return null

  return <div>test</div>
}
