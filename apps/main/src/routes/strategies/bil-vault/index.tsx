import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { BilVaultPage } from "@/modules/strategies/bil/BilVaultPage"

export const Route = createFileRoute("/strategies/bil-vault/")({
  component: BilVaultPage,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("strategiesBil", i18n.t),
  }),
})
