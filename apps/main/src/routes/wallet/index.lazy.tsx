import { createLazyFileRoute } from "@tanstack/react-router"

import { WalletPage } from "@/modules/wallet/WalletPage"

export const Route = createLazyFileRoute("/wallet/")({
  component: WalletPage,
})
