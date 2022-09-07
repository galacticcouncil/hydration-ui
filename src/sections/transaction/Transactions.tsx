import { useStore } from "state/store"
import { ReviewTransaction } from "./ReviewTransaction"

export const Transactions = () => {
  const { transactions, cancelTransaction } = useStore()

  const currentTransaction = transactions?.at(0)

  if (currentTransaction) {
    return (
      <ReviewTransaction
        onCancel={() => cancelTransaction(currentTransaction.hash)}
        {...currentTransaction}
      />
    )
  }

  return null
}
