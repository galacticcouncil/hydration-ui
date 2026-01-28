import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod/v4"

import { Page404 } from "@/components/Page404"
import { getPageMeta } from "@/config/navigation"
import { dataTableSortSchema } from "@/form/dataTableSortSchema"
import { WalletTransactionsTableColumnId } from "@/modules/wallet/transactions/WalletTransactionsTable.columns"
import { transactionTypesMock } from "@/modules/wallet/transactions/WalletTransactionsTable.data"

const typeSchema = z.object({
  type: z.array(z.enum(transactionTypesMock)).optional(),
  page: z.number().optional(),
  sort: dataTableSortSchema.default([
    { id: WalletTransactionsTableColumnId.Asset, desc: true },
  ]),
  search: z.string().optional(),
})

// TODO transactions page
export const Route = createFileRoute("/wallet/transactions")({
  // component: WalletTransactionsPage,
  component: Page404,
  // pendingComponent: WalletTransactionsSkeleton,
  validateSearch: typeSchema,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("walletTransactions", i18n.t),
  }),
})
