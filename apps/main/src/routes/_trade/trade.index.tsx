import { createFileRoute, Navigate } from "@tanstack/react-router"

import { LINKS } from "@/config/navigation"

export const Route = createFileRoute("/_trade/trade/")({
  component: () => <Navigate to={LINKS.swap} />,
})
