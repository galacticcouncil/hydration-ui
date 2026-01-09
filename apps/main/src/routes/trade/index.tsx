import { createFileRoute, Navigate } from "@tanstack/react-router"

import { LINKS } from "@/config/navigation"

export const Route = createFileRoute("/trade/")({
  component: () => <Navigate to={LINKS.swap} />,
})
