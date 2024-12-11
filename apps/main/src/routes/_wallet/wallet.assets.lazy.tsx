import { createLazyFileRoute } from "@tanstack/react-router"

import { WalletPage } from "@/modules/wallet/WalletPage"

export const Route = createLazyFileRoute("/_wallet/wallet/assets")({
  component: WalletPage,
})
