import { createFileRoute, redirect } from "@tanstack/react-router"

// Back-compat: per-asset links (/strategies/propeller/eth, /tbtc) now fold into
// the single shared subpage, which selects the collateral via an in-page switcher.
export const Route = createFileRoute("/strategies/propeller/$asset/")({
  beforeLoad: () => {
    if (!import.meta.env.DEV) {
      throw redirect({ to: "/strategies" })
    }
    throw redirect({ to: "/strategies/propeller" })
  },
})
