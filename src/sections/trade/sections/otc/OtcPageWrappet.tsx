import { OtcPageSkeleton } from "./OtcPageSkeleton"
import { OtcPage } from "./OtcPage"
import { useRpcProvider } from "providers/rpcProvider"

export const OtcPageWrapper = () => {
  const { isLoaded } = useRpcProvider()

  return !isLoaded ? <OtcPageSkeleton /> : <OtcPage />
}
