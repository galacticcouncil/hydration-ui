import { createFileRoute } from "@tanstack/react-router"

import { HdclVaultPage } from "@/modules/hdcl-vault/HdclVaultPage"

export const Route = createFileRoute("/hdcl-vault/")({
  component: HdclVaultPage,
})
