import { Modal } from "components/Modal/Modal"
import { ComponentProps, useState } from "react"
import { useTranslation } from "react-i18next"
import { WalletUpgradeModal } from "sections/wallet/upgrade/WalletUpgradeModal"
import { Transaction } from "state/store"
import { useSendTransactionMutation } from "./ReviewTransaction.utils"
import { ReviewTransactionError } from "./ReviewTransactionError"
import { ReviewTransactionForm } from "./ReviewTransactionForm"
import { ReviewTransactionPending } from "./ReviewTransactionPending"
import { ReviewTransactionSuccess } from "./ReviewTransactionSuccess"
import { ReviewTransactionToast } from "./ReviewTransactionToast"

export const ReviewTransaction = (props: Transaction) => {
  const { t } = useTranslation()
  const [minimizeModal, setMinimizeModal] = useState(false)

  const sendTx = useSendTransactionMutation()

  const modalProps: Partial<ComponentProps<typeof Modal>> =
    sendTx.isLoading || sendTx.isSuccess || sendTx.isError
      ? {
          title: undefined,
          backdrop: sendTx.isError ? "error" : "default",
          disableClose: sendTx.isLoading,
        }
      : {
          title: t("liquidity.reviewTransaction.modal.title"),
        }

  function handleClose() {
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

  const onReview = () => {
    sendTx.reset()
    setMinimizeModal(false)
  }

  return (
    <>
      {minimizeModal && (
        <ReviewTransactionToast
          id={props.id}
          mutation={sendTx}
          link={sendTx.data?.transactionLink}
          onReview={onReview}
          onClose={handleClose}
          toastMessage={props.toastMessage}
        />
      )}
      <Modal
        open={!minimizeModal}
        onClose={handleClose}
        disableCloseOutside
        {...modalProps}
      >
        <WalletUpgradeModal />
        {sendTx.isLoading ? (
          <ReviewTransactionPending
            txState={sendTx.txState}
            onClose={handleClose}
          />
        ) : sendTx.isSuccess ? (
          <ReviewTransactionSuccess onClose={handleClose} />
        ) : sendTx.isError ? (
          <ReviewTransactionError onClose={handleClose} onReview={onReview} />
        ) : (
          <ReviewTransactionForm
            tx={props.tx}
            isProxy={props.isProxy}
            overrides={props.overrides}
            title={props.title}
            onCancel={handleClose}
            onSigned={(signed) => {
              props.onSubmitted?.()
              sendTx.mutateAsync(signed)
            }}
          />
        )}
      </Modal>
    </>
  )
}
