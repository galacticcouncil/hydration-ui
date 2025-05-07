import { createFileRoute } from "@tanstack/react-router"
import { fallback, zodValidator } from "@tanstack/zod-adapter"
import * as z from "zod"

const offerSchema = z.enum(["my", "all", "partially-fillable"]).default("all")
const searchSchema = z.object({
  offers: fallback(offerSchema, "all"),
})

export type OtcOffersType = z.infer<typeof offerSchema>

export const Route = createFileRoute("/_trade/trade/otc")({
  validateSearch: zodValidator(searchSchema),
})
