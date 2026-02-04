import { XcmApprovalTracker } from "@/modules/xcm/transfer/XcmApprovalTracker"
import { XcmForm } from "@/modules/xcm/transfer/XcmForm"
import { XcmProvider } from "@/modules/xcm/transfer/XcmProvider"

export const XcmTransferApp = () => {
  return (
    <XcmProvider>
      <XcmForm />
      <XcmApprovalTracker />
    </XcmProvider>
  )
}
