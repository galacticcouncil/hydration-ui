import { createFileRoute, Navigate } from "@tanstack/react-router"

import { LINKS } from "@/config/navigation"
import { SwapPageSkeleton } from "@/modules/trade/swap/SwapPageSkeleton"

export const Route = createFileRoute("/trade/")({
  pendingComponent: SwapPageSkeleton,
  component: () => <Navigate to={LINKS.swap} />,
})
