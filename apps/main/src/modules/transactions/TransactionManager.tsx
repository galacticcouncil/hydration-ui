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

  return (
    <>
      {transactions.map((transaction) => {
        if (isMultiTransaction(transaction)) {
          return (
            <ReviewMultiTransaction
              key={transaction.id}
              transaction={transaction}
            />
          )
        }

        return (
          <TransactionProvider key={transaction.id} transaction={transaction}>
            <ReviewTransaction />
          </TransactionProvider>
        )
      })}
    </>
  )
}
