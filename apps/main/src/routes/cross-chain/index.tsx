import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { XcmTransferSkeleton } from "@/modules/xcm/transfer/XcmTransferSkeleton"
import { XcmPage } from "@/modules/xcm/XcmPage"

export const Route = createFileRoute("/cross-chain/")({
  component: XcmPage,
  pendingComponent: XcmTransferSkeleton,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("crossChain", i18n.t),
  }),
})
