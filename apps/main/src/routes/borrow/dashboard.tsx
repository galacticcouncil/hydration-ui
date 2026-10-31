import { createFileRoute, redirect } from "@tanstack/react-router"

import { LINKS } from "@/config/navigation"

export const Route = createFileRoute("/borrow/dashboard")({
  beforeLoad: ({ search }) => {
    throw redirect({ to: LINKS.borrowDashboard, search, replace: true })
  },
})
