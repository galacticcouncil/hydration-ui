import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod/v4"

import { TradeOtcPage } from "@/modules/trade/otc/TradeOtcPage"

const offerSchema = z.enum(["my", "all"]).catch("all")
const searchSchema = z.object({
  offers: offerSchema,
})

export type OtcOffersType = z.infer<typeof offerSchema>

export const Route = createFileRoute("/trade/otc")({
  component: TradeOtcPage,
  validateSearch: searchSchema,
})
