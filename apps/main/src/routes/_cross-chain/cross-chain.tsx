import { createFileRoute } from "@tanstack/react-router"

//import { XcmPage } from "@/modules/xcm/XcmPage"
import { Page404 } from "@/components/Page404"

export const Route = createFileRoute("/_cross-chain/cross-chain")({
  component: Page404,
})
