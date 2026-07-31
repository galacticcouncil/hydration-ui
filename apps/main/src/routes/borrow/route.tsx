import { CustomMarket } from "@galacticcouncil/money-market/utils"
import { createFileRoute } from "@tanstack/react-router"
import z from "zod"

import { getPageMeta } from "@/config/navigation"
import { BorrowContextProvider } from "@/modules/borrow/BorrowContextProvider"
import { SubpageLayout } from "@/modules/layout/SubpageLayout"

const searchSchema = z.object({
  market: z.enum(CustomMarket).optional().catch(undefined),
})

export type BorrowSearchParams = z.infer<typeof searchSchema>

const Page = () => (
  <BorrowContextProvider>
    <SubpageLayout />
  </BorrowContextProvider>
)

export const Route = createFileRoute("/borrow")({
  component: Page,
  validateSearch: searchSchema,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("borrow", i18n.t),
  }),
})
