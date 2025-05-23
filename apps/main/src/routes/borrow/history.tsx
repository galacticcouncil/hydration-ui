import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod"

import { lendingHistoryFilters } from "@/modules/borrow/history/LendingHistoryFilter.utils"
import { LendingHistoryPage } from "@/modules/borrow/history/LendingHistoryPage"

const filterTypeSchema = z
  .array(z.enum(lendingHistoryFilters))
  .readonly()
  .optional()
const searchSchema = z.object({
  search: z.string().optional(),
  type: filterTypeSchema,
})

export const Route = createFileRoute("/borrow/history")({
  component: LendingHistoryPage,
  validateSearch: searchSchema,
})
