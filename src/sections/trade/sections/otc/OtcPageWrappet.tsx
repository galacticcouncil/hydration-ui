import { useApiPromise } from "utils/api"
import { OtcPageSkeleton } from "./OtcPageSkeleton"
import { OtcPage } from "./OtcPage"
import { isApiLoaded } from "utils/helpers"

export const OtcPageWrapper = () => {
  const api = useApiPromise()

  return !isApiLoaded(api) ? <OtcPageSkeleton /> : <OtcPage />
}
