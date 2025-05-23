import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod"

import { SubpageLayout } from "@/modules/layout/SubpageLayout"

export const tradeOrderTabs = [
  "myActivity",
  "openOrders",
  "orderHistory",
  "marketTransactions",
] as const

export type TradeOrderTab = (typeof tradeOrderTabs)[number]

export const searchSchema = z.object({
  tab: z.enum(tradeOrderTabs).default("myActivity"),
  allPairs: z.boolean().default(false),
})

export const Route = createFileRoute("/trade")({
  component: SubpageLayout,
})
