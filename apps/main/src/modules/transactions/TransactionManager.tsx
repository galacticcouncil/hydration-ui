import { useProcessTransactionToasts } from "@/modules/transactions/hooks/useProcessTransactionToasts"
import { ReviewTransaction } from "@/modules/transactions/review/ReviewTransaction"
import { TransactionProvider } from "@/modules/transactions/TransactionProvider"
import { useToasts } from "@/states/toasts"
import { useTransactionsStore } from "@/states/transactions"

export const TransactionManager = () => {
  const { transactions } = useTransactionsStore()
  const { toasts } = useToasts()

  useProcessTransactionToasts(toasts)

  return transactions.map((transaction) => (
    <TransactionProvider key={transaction.id} {...transaction}>
      <ReviewTransaction />
    </TransactionProvider>
  ))
}
