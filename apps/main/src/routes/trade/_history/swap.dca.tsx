import { createFileRoute } from "@tanstack/react-router"

import { Dca } from "@/modules/trade/swap/sections/DCA/Dca"

export const Route = createFileRoute("/trade/_history/swap/dca")({
  component: Dca,
})
