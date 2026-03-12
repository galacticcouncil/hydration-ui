import { createFileRoute } from "@tanstack/react-router"

import { WdclVaultPage } from "@/modules/wdcl-vault/WdclVaultPage"

export const Route = createFileRoute("/wdcl-vault/")({
  component: WdclVaultPage,
})
