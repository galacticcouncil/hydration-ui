import { AccountOverrideProvider } from "@galacticcouncil/web3-connect"

import { useIntentToasts } from "@/modules/transactions/hooks/useIntentToasts"
import { useProcessTransactionToasts } from "@/modules/transactions/hooks/useProcessTransactionToasts"
import { ReviewMultiTransaction } from "@/modules/transactions/review/ReviewMultiTransaction"
import { ReviewTransaction } from "@/modules/transactions/review/ReviewTransaction"
import { TransactionProvider } from "@/modules/transactions/TransactionProvider"
import { isTransactionToast, useToasts } from "@/states/toasts"
import { isMultiTransaction, useTransactionsStore } from "@/states/transactions"

export const TransactionManager = () => {
  const { transactions } = useTransactionsStore()
  const { toasts } = useToasts()

  const transactionToasts = toasts.filter(isTransactionToast)

  useProcessTransactionToasts(transactionToasts)
  useIntentToasts(transactionToasts)

  return (
    <>
      {transactions.map((transaction) => {
        if (isMultiTransaction(transaction)) {
          return (
            <AccountOverrideProvider
              key={transaction.id}
              value={transaction.signingAccount}
            >
              <ReviewMultiTransaction transaction={transaction} />
            </AccountOverrideProvider>
          )
        }

        return (
          <AccountOverrideProvider
            key={transaction.id}
            value={transaction.signingAccount}
          >
            <TransactionProvider transaction={transaction}>
              <ReviewTransaction />
            </TransactionProvider>
          </AccountOverrideProvider>
        )
      })}
    </>
  )
}
