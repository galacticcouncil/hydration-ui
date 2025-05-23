import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod"

import { TradeOtcPage } from "@/modules/trade/otc/TradeOtcPage"

const offerSchema = z.enum(["my", "all", "partially-fillable"]).default("all")
const searchSchema = z.object({
  offers: offerSchema,
})

export type OtcOffersType = z.infer<typeof offerSchema>

export const Route = createFileRoute("/_trade/trade/otc")({
  component: TradeOtcPage,
  validateSearch: searchSchema,
})
