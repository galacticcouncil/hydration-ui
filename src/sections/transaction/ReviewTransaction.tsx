import { useState, useEffect } from "react"
import { Transaction, useStore } from "state/store"

import { ReviewTransactionPending } from "./ReviewTransactionPending"
import { ReviewTransactionSuccess } from "./ReviewTransactionSuccess"
import { ReviewTransactionError } from "./ReviewTransactionError"
import { ReviewTransactionForm } from "./ReviewTransactionForm"
import { ReviewTransactionToast } from "./ReviewTransactionToast"
import { useSendTransactionMutation } from "./ReviewTransaction.utils"

interface ReviewTransactionProps extends Transaction {
  handleModalClose?: () => void
  onBack?: () => void
  setOpen: () => void
  setToasts: (toast: any) => void
  open: boolean
}

export const ReviewTransaction = (props: ReviewTransactionProps) => {
  const [minimizeModal, setMinimizeModal] = useState(false)

  const sendTx = useSendTransactionMutation()

  useEffect(() => {
    /*props.setTransactionMutations((mutations) => ({
      ...(mutations ?? []),
      [props.id]: sendTx,
    }))*/
    /*store.addTransaction({
      id: props.id,
      modal: (
        <ReviewTransactionForm
          tx={props.tx}
          overrides={props.overrides}
          title={props.title}
          onCancel={props.handleModalClose}
          onSigned={(signed) => {
            props.onSubmitted?.()
            sendTx.mutateAsync(signed)
          }}
          onBack={handleClose}
        />
      ),
      sendTx,
    })*/
  }, [sendTx])

  function handleClose() {
    if (sendTx.isLoading) {
      setMinimizeModal(true)

      props.setOpen()
      return
    }

    if (sendTx.isSuccess) {
      props.onSuccess?.(sendTx.data)
    } else {
      props.onError?.()
    }
  }

  const onReview = () => {
    sendTx.reset()
    setMinimizeModal(false)
  }

  if (props.open) return null

  // I need to put out this somehow
  return (
    <ReviewTransactionToast
      id={props.id}
      mutation={sendTx}
      link={sendTx.data?.transactionLink}
      onReview={onReview}
      onClose={handleClose}
      toastMessage={props.toastMessage}
    />
  )
}

export const TransactionModal = ({ props, sendTx, handleClose, onReview }) => {
  return sendTx.isLoading ? (
    <ReviewTransactionPending txState={sendTx.txState} onClose={handleClose} />
  ) : sendTx.isSuccess ? (
    <ReviewTransactionSuccess onClose={handleClose} />
  ) : sendTx.isError ? (
    <ReviewTransactionError onClose={handleClose} onReview={onReview} />
  ) : (
    <ReviewTransactionForm
      tx={props.tx}
      overrides={props.overrides}
      title={props.title}
      onCancel={props.handleModalClose}
      onSigned={(signed) => {
        props.onSubmitted?.()
        sendTx.mutateAsync(signed)
      }}
      onBack={handleClose}
    />
  )
}

export const useExample1 = (props: ReviewTransactionProps) => {
  const sendTx = useSendTransactionMutation()
  const [minimizeModal, setMinimizeModal] = useState(false)

  const { cancelTransaction, cancelAllTransactions } = useStore()

  function handleClose() {
    if (sendTx.isLoading) {
      setMinimizeModal(true)

      //props.setOpen()
      return
    }

    if (sendTx.isSuccess) {
      props.onSuccess?.(sendTx.data)
      cancelTransaction(props.id)
    } else {
      cancelTransaction(props.id)
      props.onError?.()
    }
  }

  const onReview = () => {
    sendTx.reset()
    // setMinimizeModal(false)
  }

  const toast = minimizeModal && (
    <ReviewTransactionToast
      id={props.id}
      mutation={sendTx}
      link={sendTx.data?.transactionLink}
      onReview={onReview}
      onClose={handleClose}
      toastMessage={props.toastMessage}
    />
  )

  const modal = sendTx.isLoading ? (
    <ReviewTransactionPending txState={sendTx.txState} onClose={handleClose} />
  ) : sendTx.isSuccess ? (
    <ReviewTransactionSuccess onClose={handleClose} />
  ) : sendTx.isError ? (
    <ReviewTransactionError onClose={handleClose} onReview={onReview} />
  ) : (
    <ReviewTransactionForm
      tx={props.tx}
      overrides={props.overrides}
      title={props.title}
      onCancel={cancelAllTransactions}
      onSigned={(signed) => {
        props.onSubmitted?.()
        sendTx.mutateAsync(signed)
      }}
      onBack={handleClose}
    />
  )

  return { toast, modal: !minimizeModal ? modal : undefined }
}
