import { createFileRoute } from "@tanstack/react-router"
import z from "zod"

import { dataTableSortSchema } from "@/form/dataTableSortSchema"
import { MarketsPage } from "@/modules/money-market-v2/MarketsPage"

const searchSchema = z.object({
  sort: dataTableSortSchema,
  search: z.string().optional(),
})

export const Route = createFileRoute("/money-market/markets/")({
  component: MarketsPage,
  validateSearch: searchSchema,
})
