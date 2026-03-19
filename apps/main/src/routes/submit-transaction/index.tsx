import { createFileRoute } from "@tanstack/react-router"

import { SubmitTransactionPage } from "@/modules/submit-transaction/SubmitTransactionPage"

export const Route = createFileRoute("/submit-transaction/")({
  component: SubmitTransactionPage,
})
