import { Modal } from "components/Modal/Modal"
import { Stepper } from "components/Stepper/Stepper"
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
import { useWalletConnect } from "components/OnboardProvider/OnboardProvider"

export const ReviewTransaction = (props: Transaction) => {
  const { t } = useTranslation()
  const [minimizeModal, setMinimizeModal] = useState(false)

  const { wallet } = useWalletConnect()
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
          description: t("liquidity.reviewTransaction.modal.desc"),
        }

  const handleTxOnClose = () => {
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

  const onClose = () => {
    handleTxOnClose()
    props.onClose?.()
  }

  const onBack = props.onBack
    ? () => {
        handleTxOnClose()
        props.onBack?.()
      }
    : undefined

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
          onClose={onClose}
          toastMessage={props.toastMessage}
        />
      )}
      <Modal
        open={!minimizeModal}
        onBack={onBack}
        onClose={onClose}
        disableCloseOutside
        topContent={props.steps ? <Stepper steps={props.steps} /> : undefined}
        {...modalProps}
      >
        {!wallet?.isConnected && <WalletUpgradeModal />}
        {sendTx.isLoading ? (
          <ReviewTransactionPending
            txState={sendTx.txState}
            onClose={onClose}
          />
        ) : sendTx.isSuccess ? (
          <ReviewTransactionSuccess onClose={onClose} />
        ) : sendTx.isError ? (
          <ReviewTransactionError onClose={onClose} onReview={onReview} />
        ) : (
          <ReviewTransactionForm
            tx={props.tx}
            isProxy={props.isProxy}
            overrides={props.overrides}
            title={props.title}
            onCancel={onClose}
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
