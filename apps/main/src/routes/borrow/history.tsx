import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod/v4"

import { borrowHistoryFilters } from "@/modules/borrow/history/BorrowHistoryFilter.utils"
import { BorrowHistoryPage } from "@/modules/borrow/history/BorrowHistoryPage"

const filterTypeSchema = z
  .array(z.enum(borrowHistoryFilters))
  .readonly()
  .optional()
const searchSchema = z.object({
  type: filterTypeSchema,
})

export const Route = createFileRoute("/borrow/history")({
  component: BorrowHistoryPage,
  validateSearch: searchSchema,
})
