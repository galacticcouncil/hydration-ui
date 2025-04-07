import { createLazyFileRoute, Navigate } from "@tanstack/react-router"

import { LINKS } from "@/config/navigation"

export const Route = createLazyFileRoute("/_liquidity/liquidity/")({
  component: () => Navigate({ to: LINKS.pools }),
})
