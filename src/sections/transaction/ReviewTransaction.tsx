import { useState } from "react"
import { Transaction, useStore } from "state/store"

import { ReviewTransactionPending } from "./ReviewTransactionPending"
import { ReviewTransactionSuccess } from "./ReviewTransactionSuccess"
import { ReviewTransactionError } from "./ReviewTransactionError"
import { ReviewTransactionForm } from "./ReviewTransactionForm"
import { ReviewTransactionToast } from "./ReviewTransactionToast"
import { useSendTransactionMutation } from "./ReviewTransaction.utils"
import { Modal } from "components/Modal/Modal"
import { Stepper } from "components/Stepper/Stepper"
import { SubmittableExtrinsic } from "@polkadot/api/types"

export const ReviewTransaction = (props: Transaction) => {
  const { cancelAllTransactions, cancelTransaction } = useStore()
  const [minimizeModal, setMinimizeModal] = useState(false)

  const sendTx = useSendTransactionMutation()

  function handleCloseToast() {
    if (sendTx.isLoading) {
      setMinimizeModal(true)
      return
    }

    if (sendTx.isSuccess) {
      props.onSuccess?.(sendTx.data)
    } else {
      props.onError?.()
    }
  }

  const minimizeTransaction = () => {
    setMinimizeModal(true)
    props.onError()
  }

  const handleOnCloseModal = () => {
    props.onError()
    props.onClose?.()
    cancelAllTransactions()
  }

  const onReview = () => {
    sendTx.reset()
    setMinimizeModal(false)
  }

  const handleOnError = () => {
    props.onError()
    cancelTransaction(props.id)
  }

  const handleOnSuccess = () => {
    sendTx.data && props.onSuccess?.(sendTx.data)
    cancelTransaction(props.id)
  }

  const handleOnSubmit = (signed: SubmittableExtrinsic<"promise">) => {
    props.onSubmitted?.()
    sendTx.mutateAsync(signed)
  }

  const handleBack = () => {
    cancelTransaction(props.id)
    props.onBack()
  }

  const withoutClose = props.steps?.slice(-1)?.[0].state === "todo"

  if (!minimizeModal)
    return (
      <Modal
        open
        topContent={props.steps ? <Stepper steps={props.steps} /> : undefined}
        withoutClose={sendTx.isLoading}
        onClose={handleOnCloseModal}
      >
        {sendTx.isLoading ? (
          <ReviewTransactionPending
            txState={sendTx.txState}
            onClose={minimizeTransaction}
            withoutClose={withoutClose}
          />
        ) : sendTx.isSuccess ? (
          <ReviewTransactionSuccess handleOnSuccess={handleOnSuccess} />
        ) : sendTx.isError ? (
          <ReviewTransactionError
            handleOnError={handleOnError}
            onReview={onReview}
          />
        ) : (
          <ReviewTransactionForm
            tx={props.tx}
            isProxy={props.isProxy}
            overrides={props.overrides}
            title={props.title}
            onCancel={handleOnCloseModal}
            onSigned={handleOnSubmit}
            onBack={props.withBack ? handleBack : undefined}
          />
        )}
      </Modal>
    )

  return (
    <ReviewTransactionToast
      id={props.id}
      mutation={sendTx}
      link={sendTx.data?.transactionLink}
      onReview={onReview}
      onClose={handleCloseToast}
      toastMessage={props.toastMessage}
    />
  )
}
