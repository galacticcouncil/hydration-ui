import { ReviewTransaction } from "@/modules/transactions/review/ReviewTransaction"
import { TransactionProvider } from "@/modules/transactions/TransactionProvider"
import { useTransactionsStore } from "@/states/transactions"

export const TransactionManager = () => {
  const { transactions } = useTransactionsStore()

  return transactions.map((transaction) => (
    <TransactionProvider key={transaction.id} {...transaction}>
      <ReviewTransaction />
    </TransactionProvider>
  ))
}
