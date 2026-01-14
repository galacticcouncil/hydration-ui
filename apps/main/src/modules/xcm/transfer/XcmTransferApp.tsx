import { XcmForm } from "@/modules/xcm/transfer/XcmForm"
import { XcmProvider } from "@/modules/xcm/transfer/XcmProvider"

export const XcmTransferApp = () => {
  return (
    <XcmProvider>
      <XcmForm />
    </XcmProvider>
  )
}
