import { LegacyProvider } from "@/modules/xcm/legacy/LegacyProvider"
import { XcmTransferApp } from "@/modules/xcm/transfer/XcmTransferApp"

export const XcmPage = () => {
  return (
    <LegacyProvider>
      <XcmTransferApp />
    </LegacyProvider>
  )
}
