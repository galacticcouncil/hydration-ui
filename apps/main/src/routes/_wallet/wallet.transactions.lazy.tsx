import { createLazyFileRoute } from "@tanstack/react-router"

import { WalletTransactionsPage } from "@/modules/wallet/transactions/WalletTransactionsPage"

export const Route = createLazyFileRoute("/_wallet/wallet/transactions")({
  component: WalletTransactionsPage,
})
