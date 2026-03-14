import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { DepositManager } from "@/modules/onramp/deposit/DepositManager"
import { DepositPage } from "@/modules/onramp/deposit/DepositPage"

export const Route = createFileRoute("/deposit/")({
  component: () => (
    <>
      <DepositPage />
      <DepositManager />
    </>
  ),
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("deposit", i18n.t),
  }),
})
