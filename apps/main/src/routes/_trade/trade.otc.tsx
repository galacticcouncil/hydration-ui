import { createFileRoute } from "@tanstack/react-router"
import { fallback, zodValidator } from "@tanstack/zod-adapter"
import * as z from "zod"

const searchSchema = z.object({
  offers: fallback(z.enum(["my", "all", "partially-fillable"]), "all").default(
    "all",
  ),
})

export type OtcOffersType = z.infer<typeof searchSchema>["offers"]

export const Route = createFileRoute("/_trade/trade/otc")({
  validateSearch: zodValidator(searchSchema),
})
