import { createFileRoute } from "@tanstack/react-router"

import { xcmQueryParamsSchema } from "@/modules/xcm/transfer/utils/query"
import { XcmPage } from "@/modules/xcm/XcmPage"
import { XcmPageSkeleton } from "@/modules/xcm/XcmPageSkeleton"

const Page = () => <XcmPage />

export const Route = createFileRoute("/cross-chain/")({
  component: Page,
  pendingComponent: XcmPageSkeleton,
  validateSearch: xcmQueryParamsSchema,
})
