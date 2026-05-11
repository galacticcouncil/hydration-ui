import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { HdclVaultPage } from "@/modules/strategies/hdcl/HdclVaultPage"

export const Route = createFileRoute("/strategies/hdcl-vault/")({
  component: HdclVaultPage,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("strategiesHdcl", i18n.t),
  }),
})
