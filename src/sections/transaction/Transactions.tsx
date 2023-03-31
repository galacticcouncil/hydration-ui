import { useStore } from "state/store"
import {
  ReviewTransaction,
  ReviewTransactionTwo,
  TransactionModal,
  useExample1,
} from "./ReviewTransaction"
import { Modal } from "components/Modal/Modal"
import { useState } from "react"
import { WalletUpgradeModal } from "sections/wallet/upgrade/WalletUpgradeModal"
import { useSendTransactionMutation } from "./ReviewTransaction.utils"

export const Transactions = () => {
  const { transactions, cancelTransaction, cancelAllTransactions } = useStore()
  const [hiddenTransactions, setHiddenTransactions] = useState<string[]>([])
  const [toats, setToasts] = useState([])

  const example1 = useExample1(transactions?.[0] ?? {})

  const filteredTransactions = transactions?.filter(
    (tran) => !hiddenTransactions.includes(tran.id),
  )

  console.log(transactions, filteredTransactions, "transactions")
  if (!transactions || !transactions.length) return null
  /// if modal closed, toast will be dropped as well, since Modal is unmounted
  return (
    <>
      {example1?.toast}
      <WalletUpgradeModal />
      <Modal open={!!example1.modal} onClose={cancelAllTransactions}>
        {example1.modal}
        {/*transactions.map((currentTransaction) => {
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
              handleModalClose={() => {
                cancelAllTransactions()
              }}
              open={filteredTransactions?.[0]?.id === currentTransaction.id}
              setOpen={() => {
                setHiddenTransactions((state) => [
                  ...state,
                  currentTransaction.id,
                ])
              }}
              setToasts={setToasts}
            />
          )
        })*/}
      </Modal>
    </>
  )
}
