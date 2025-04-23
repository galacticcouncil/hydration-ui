import { createFileRoute } from "@tanstack/react-router"

import { XcmPage } from "@/modules/xcm/XcmPage"

export const Route = createFileRoute("/_cross-chain/cross-chain")({
  component: XcmPage,
})
