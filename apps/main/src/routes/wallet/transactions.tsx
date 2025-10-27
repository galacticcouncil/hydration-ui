import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod/v4"

import { Page404 } from "@/components/Page404"
import { transactionTypesMock } from "@/modules/wallet/transactions/WalletTransactionsTable.data"

const typeSchema = z.object({
  type: z.array(z.enum(transactionTypesMock)).optional(),
})

// TODO transactions page
export const Route = createFileRoute("/wallet/transactions")({
  // component: WalletTransactionsPage,
  component: Page404,
  // pendingComponent: WalletTransactionsSkeleton,
  validateSearch: typeSchema,
})
