import { createFileRoute } from "@tanstack/react-router"

import { xcmQueryParamsSchema } from "@/modules/xcm/transfer/utils/query"
import { XcmTransferSkeleton } from "@/modules/xcm/transfer/XcmTransferSkeleton"
import { XcmPage } from "@/modules/xcm/XcmPage"

export const Route = createFileRoute("/cross-chain/")({
  component: XcmPage,
  pendingComponent: XcmTransferSkeleton,
  validateSearch: xcmQueryParamsSchema,
})
