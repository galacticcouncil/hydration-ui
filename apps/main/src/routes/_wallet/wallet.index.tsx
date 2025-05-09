import { createFileRoute, Navigate } from "@tanstack/react-router"

import { LINKS } from "@/config/navigation"

export const Route = createFileRoute("/_wallet/wallet/")({
  component: () => Navigate({ to: LINKS.walletAssets }),
})
