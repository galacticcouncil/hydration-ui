import { createFileRoute } from "@tanstack/react-router"

import { xcmQueryParamsSchema } from "@/modules/xcm/transfer/utils/query"
import { XcmPage } from "@/modules/xcm/XcmPage"
import { XcmPageSkeleton } from "@/modules/xcm/XcmPageSkeleton"

export const Route = createFileRoute("/cross-chain/")({
  component: XcmPage,
  pendingComponent: XcmPageSkeleton,
  validateSearch: xcmQueryParamsSchema,
})
