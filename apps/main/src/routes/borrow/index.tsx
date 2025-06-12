import { createFileRoute, Navigate } from "@tanstack/react-router"

import { LINKS } from "@/config/navigation"

export const Route = createFileRoute("/borrow/")({
  component: () => Navigate({ to: LINKS.borrowDashboard }),
})
