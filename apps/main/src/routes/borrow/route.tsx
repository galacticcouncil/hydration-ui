import { createFileRoute } from "@tanstack/react-router"

import { BorrowContextProvider } from "@/modules/borrow/BorrowContextProvider"
import { SubpageLayout } from "@/modules/layout/SubpageLayout"

const Page = () => (
  <BorrowContextProvider>
    <SubpageLayout />
  </BorrowContextProvider>
)

export const Route = createFileRoute("/borrow")({
  component: Page,
})
