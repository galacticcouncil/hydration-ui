import { useApiPromise } from "utils/api"
import { OtcPageSkeleton } from "./OtcPageSkeleton"
import { OtcPage } from "./OtcPage"
import { Page } from "components/Layout/Page/Page"
import { isApiLoaded } from "utils/helpers"

export const OtcPageWrapper = () => {
  const api = useApiPromise()

  return <Page>{!isApiLoaded(api) ? <OtcPageSkeleton /> : <OtcPage />}</Page>
}
