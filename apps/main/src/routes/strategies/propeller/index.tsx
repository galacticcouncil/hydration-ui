import { createFileRoute, redirect } from "@tanstack/react-router"

// Back-compat: the shared Propeller subpage is gone — every collateral vault is
// now its own strategy at /strategies/propeller-<asset>.
export const Route = createFileRoute("/strategies/propeller/")({
  beforeLoad: () => {
    throw redirect({ to: "/strategies" })
  },
})
