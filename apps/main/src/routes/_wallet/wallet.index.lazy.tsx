import { createLazyFileRoute, Navigate } from "@tanstack/react-router"

import { LINKS } from "@/config/navigation"

export const Route = createLazyFileRoute("/_wallet/wallet/")({
  component: () => Navigate({ to: LINKS.walletAssets }),
})
