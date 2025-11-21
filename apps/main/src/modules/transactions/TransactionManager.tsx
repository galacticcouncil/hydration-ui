import { useProcessTransactionToasts } from "@/modules/transactions/hooks/useProcessTransactionToasts"
import { ReviewMultipleTransactions } from "@/modules/transactions/review/ReviewMultipleTransactions"
import { ReviewTransaction } from "@/modules/transactions/review/ReviewTransaction"
import { TransactionProvider } from "@/modules/transactions/TransactionProvider"
import { useToasts } from "@/states/toasts"
import { useTransactionsStore } from "@/states/transactions"

export const TransactionManager = () => {
  const { transactions } = useTransactionsStore()
  const { toasts } = useToasts()

  useProcessTransactionToasts(toasts)

  const transactionsWithStepper = transactions.filter(
    (transaction) => transaction.steps,
  )
  const transactionsBasic = transactions.filter(
    (transaction) => !transaction.steps,
  )

  return (
    <>
      {transactionsBasic.map((transaction) => (
        <TransactionProvider key={transaction.id} {...transaction}>
          <ReviewTransaction />
        </TransactionProvider>
      ))}

      {!!transactionsWithStepper.length && (
        <ReviewMultipleTransactions transactions={transactionsWithStepper} />
      )}
    </>
  )
}
