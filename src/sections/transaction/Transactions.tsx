import { useStore } from "state/store"
import { ReviewTransaction } from "./ReviewTransaction"

export const Transactions = () => {
  const { transactions, cancelTransaction } = useStore()

  const currentTransaction = transactions?.at(0)

  if (currentTransaction) {
    return (
      <ReviewTransaction
        {...currentTransaction}
        onError={() => {
          cancelTransaction(currentTransaction.hash)
          currentTransaction.onError?.()
        }}
        onSuccess={(result) => {
          cancelTransaction(currentTransaction.hash)
          currentTransaction.onSuccess?.(result)
        }}
      />
    )
  }

  return null
}
