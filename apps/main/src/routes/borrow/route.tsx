import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { BorrowContextProvider } from "@/modules/borrow/BorrowContextProvider"
import { SubpageLayout } from "@/modules/layout/SubpageLayout"

const Page = () => (
  <BorrowContextProvider>
    <SubpageLayout />
  </BorrowContextProvider>
)

export const Route = createFileRoute("/borrow")({
  component: Page,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("borrow", i18n.t),
  }),
})
