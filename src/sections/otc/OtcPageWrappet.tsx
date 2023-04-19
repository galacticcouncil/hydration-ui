import { useApiPromise } from "utils/api"
import { OtcPageSkeleton } from "./OtcPageSkeleton"
import { OtcPage } from "./OtcPage"
import { Page } from "components/Layout/Page/Page"

export const OtcPageWrapper = () => {
  const api = useApiPromise()

  return (
    <Page>{!Object.keys(api).length ? <OtcPageSkeleton /> : <OtcPage />}</Page>
  )
}
