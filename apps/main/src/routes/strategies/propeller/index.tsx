import { createFileRoute, redirect } from "@tanstack/react-router"

import { DEFAULT_PROPELLER_ASSET } from "@/modules/strategies/propeller/vaults"

// /strategies/propeller/ → default collateral subpage (back-compat for old links)
export const Route = createFileRoute("/strategies/propeller/")({
  beforeLoad: () => {
    throw redirect({
      to: "/strategies/propeller/$asset",
      params: { asset: DEFAULT_PROPELLER_ASSET },
    })
  },
})
