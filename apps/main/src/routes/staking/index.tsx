import { createFileRoute, Navigate } from "@tanstack/react-router"

import { LINKS } from "@/config/navigation"

export const Route = createFileRoute("/staking/")({
  component: () => Navigate({ to: LINKS.stakingOverview }),
})
