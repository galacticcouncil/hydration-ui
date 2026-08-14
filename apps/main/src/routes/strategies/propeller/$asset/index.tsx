import { createFileRoute, redirect } from "@tanstack/react-router"

// Back-compat: per-asset links (/strategies/propeller/eth, /tbtc) predate the
// flat per-vault routes at /strategies/propeller-<asset>.
export const Route = createFileRoute("/strategies/propeller/$asset/")({
  beforeLoad: () => {
    throw redirect({ to: "/strategies" })
  },
})
