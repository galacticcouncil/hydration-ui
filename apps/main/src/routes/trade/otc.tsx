import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod/v4"

import { getPageMeta } from "@/config/navigation"
import { dataTableSortSchema } from "@/form/dataTableSortSchema"
import { OtcColumn } from "@/modules/trade/otc/table/OtcTable.columns"
import { TradeOtcPage } from "@/modules/trade/otc/TradeOtcPage"

const offerSchema = z.enum(["my", "all"]).catch("all")
const searchSchema = z.object({
  offers: offerSchema,
  page: z.number().optional(),
  sort: dataTableSortSchema.default([
    { id: OtcColumn.MarketPrice, desc: false },
  ]),
  search: z.string().optional(),
})

export type OtcOffersType = z.infer<typeof offerSchema>

export const Route = createFileRoute("/trade/otc")({
  component: TradeOtcPage,
  validateSearch: searchSchema,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("otc", i18n.t),
  }),
})
