import { createFileRoute, redirect } from "@tanstack/react-router"

import { LINKS } from "@/config/navigation"

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: LINKS.swapMarket, replace: true })
  },
})
