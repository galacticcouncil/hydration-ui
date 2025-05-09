import { createFileRoute } from "@tanstack/react-router"

import { DCA } from "@/modules/trade/sections/DCA/DCA"

export const Route = createFileRoute("/_trade/trade/swap/dca")({
  component: DCA,
})
