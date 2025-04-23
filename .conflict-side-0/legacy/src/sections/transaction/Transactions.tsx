import { useStore } from "state/store"
import { ReviewTransaction } from "./ReviewTransaction"

export const Transactions = () => {
  const { transactions, cancelTransaction } = useStore()

  return (
    <>
      {transactions?.map((currentTransaction) => {
        return (
          <ReviewTransaction
            key={currentTransaction.id}
            {...currentTransaction}
            onError={() => {
              cancelTransaction(currentTransaction.id)
              currentTransaction.onError?.()
            }}
            onSuccess={(result) => {
              cancelTransaction(currentTransaction.id)
              currentTransaction.onSuccess?.(result)
            }}
          />
        )
      })}
    </>
  )
}
