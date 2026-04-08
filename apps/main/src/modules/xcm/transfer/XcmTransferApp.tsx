import { XcmQueryParams } from "@/modules/xcm/transfer/utils/query"
import { XcmForm } from "@/modules/xcm/transfer/XcmForm"
import { XcmProvider } from "@/modules/xcm/transfer/XcmProvider"

type XcmTransferAppProps = {
  initialSearch?: XcmQueryParams
}

export const XcmTransferApp = ({ initialSearch }: XcmTransferAppProps) => {
  return (
    <XcmProvider initialSearch={initialSearch}>
      <XcmForm />
    </XcmProvider>
  )
}
