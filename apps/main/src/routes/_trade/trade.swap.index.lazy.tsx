import { createLazyFileRoute, Navigate } from "@tanstack/react-router"

import { swapTabs } from "@/modules/trade/components"

export const Route = createLazyFileRoute("/_trade/trade/swap/")({
  component: () => (
    <Navigate to={"/trade/swap/$section"} params={{ section: swapTabs[0] }} />
  ),
})
