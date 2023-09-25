import { OtcPageSkeleton } from "./OtcPageSkeleton"
import { OtcPage } from "./OtcPage"
import { Page } from "components/Layout/Page/Page"
import { useRpcProvider } from "providers/rpcProvider"

export const OtcPageWrapper = () => {
  const { isLoaded } = useRpcProvider()

  return <Page>{!isLoaded ? <OtcPageSkeleton /> : <OtcPage />}</Page>
}
