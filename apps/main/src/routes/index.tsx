import { createFileRoute, Navigate } from "@tanstack/react-router"

import { LINKS } from "@/config/navigation"

export const Route = createFileRoute("/")({
  component: () => <Navigate to={LINKS.swap} />,
})
