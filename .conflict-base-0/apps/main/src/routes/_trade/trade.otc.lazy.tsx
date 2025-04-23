import { createLazyFileRoute } from "@tanstack/react-router"

import { TradeOtcPage } from "@/modules/trade/otc/TradeOtcPage"

export const Route = createLazyFileRoute("/_trade/trade/otc")({
  component: TradeOtcPage,
})
