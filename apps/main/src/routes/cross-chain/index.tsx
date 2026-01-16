import { createFileRoute } from "@tanstack/react-router"

import { XcmTransferSkeleton } from "@/modules/xcm/transfer/XcmTransferSkeleton"
import { XcmPage } from "@/modules/xcm/XcmPage"

export const Route = createFileRoute("/cross-chain/")({
  component: XcmPage,
  pendingComponent: XcmTransferSkeleton,
})
