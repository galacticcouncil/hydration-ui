import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { DepositPreviewPage } from "@/modules/onramp/deposit/preview/DepositPreviewPage"

export const Route = createFileRoute("/deposit/preview")({
  component: DepositPreviewPage,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({ meta: getPageMeta("deposit", i18n.t) }),
})
