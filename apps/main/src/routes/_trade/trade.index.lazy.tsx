import { createLazyFileRoute, Navigate } from "@tanstack/react-router"

import { LINKS } from "@/config/navigation"

export const Route = createLazyFileRoute("/_trade/trade/")({
  component: () => <Navigate to={LINKS.swap} />,
})
