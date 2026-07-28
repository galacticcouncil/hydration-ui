import { createFileRoute } from "@tanstack/react-router"

import { WithdrawPage } from "@/modules/onramp/withdraw/WithdrawPage"

export const Route = createFileRoute("/withdraw/")({
  component: WithdrawPage,
})
