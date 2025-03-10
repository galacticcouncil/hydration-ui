import { Modal } from "components/Modal/Modal"
import { Stepper } from "components/Stepper/Stepper"
import { ComponentProps, useState } from "react"
import { useTranslation } from "react-i18next"
import { Transaction, useStore } from "state/store"
import { useSendTx } from "./ReviewTransaction.utils"
import { ReviewTransactionError } from "./ReviewTransactionError"
import { ReviewTransactionForm } from "./ReviewTransactionForm"
import { ReviewTransactionPending } from "./ReviewTransactionPending"
import { ReviewTransactionSuccess } from "./ReviewTransactionSuccess"
import { ReviewTransactionXCallForm } from "./ReviewTransactionXCallForm"
import { ReviewTransactionEvmTxForm } from "sections/transaction/ReviewTransactionEvmTxForm"
import { WalletUpgradeModal } from "sections/web3-connect/upgrade/WalletUpgradeModal"
import {
  isEvmCall,
  isSolanaCall,
} from "sections/transaction/ReviewTransactionXCallForm.utils"
import { useRpcProvider } from "providers/rpcProvider"

export const ReviewTransaction = (props: Transaction) => {
  const { isLoaded } = useRpcProvider()
  const { t } = useTranslation()
  const [minimizeModal, setMinimizeModal] = useState(false)
  const [signError, setSignError] = useState<unknown>()
  const { cancelTransaction } = useStore()

  const {
    sendTx,
    sendEvmTx,
    sendPermitTx,
    sendSolanaTx,
    isLoading,
    isSuccess,
    isError: isSendError,
    error: sendError,
    isBroadcasted,
    reset,
  } = useSendTx({
    id: props.id,
    toast: props.toast,
    onSuccess: (data) => props.onSuccess?.(data),
    onError: props.onError,
    xcallMeta: props.xcallMeta,
  })

  if (!isLoaded) return null

  const isError = isSendError || !!signError
  const error = sendError || signError

  const modalProps: Partial<ComponentProps<typeof Modal>> =
    (isLoading && isBroadcasted) || isSuccess || isError
      ? {
          title: undefined,
          backdrop: isError ? "error" : "default",
          disableClose: isLoading,
        }
      : {
          title: props.title ?? t("liquidity.reviewTransaction.modal.title"),
          description:
            props.description ?? t("liquidity.reviewTransaction.modal.desc"),
        }

  const onClose = () => {
    setMinimizeModal(true)
    props.onClose?.()
    cancelTransaction(props.id)
  }

  const onMinimizeModal = () => {
    setMinimizeModal(true)
    if (!props.disableAutoClose) props.onClose?.()
  }

  const onBack = props.onBack
    ? () => {
        setMinimizeModal(true)
        props.onBack?.()
      }
    : undefined

  const onReview = () => {
    reset()
    setMinimizeModal(true)
  }

  return (
    <>
      <Modal
        open={!minimizeModal}
        onBack={onBack}
        onClose={onClose}
        disableCloseOutside
        topContent={
          props.steps ? (
            <Stepper sx={{ px: [10] }} width={420} steps={props.steps} />
          ) : undefined
        }
        {...modalProps}
      >
        {isLoading && isBroadcasted ? (
          <ReviewTransactionPending onClose={onMinimizeModal} />
        ) : isSuccess ? (
          <ReviewTransactionSuccess onClose={onMinimizeModal} />
        ) : isError ? (
          <ReviewTransactionError
            onClose={onMinimizeModal}
            onReview={onReview}
            error={error}
          />
        ) : props.tx ? (
          <ReviewTransactionForm
            tx={props.tx}
            txOptions={props.txOptions}
            xcallMeta={props.xcallMeta}
            evmTx={props.evmTx}
            isProxy={props.isProxy}
            overrides={props.overrides}
            onCancel={onClose}
            onEvmSigned={(data) => {
              props.onSubmitted?.()
              sendEvmTx(data)
            }}
            onSigned={(tx) => {
              props.onSubmitted?.()
              sendTx({ tx })
            }}
            onPermitDispatched={(permit) => {
              props.onSubmitted?.()
              sendPermitTx(permit)
            }}
            onSignError={setSignError}
            isLoading={isLoading}
          />
        ) : props.evmTx ? (
          <ReviewTransactionEvmTxForm
            tx={props.evmTx}
            onCancel={onClose}
            onEvmSigned={(data) => {
              props.onSubmitted?.()
              sendEvmTx(data)
            }}
            onPermitDispatched={(permit) => {
              props.onSubmitted?.()
              sendPermitTx(permit)
            }}
          />
        ) : (isEvmCall(props.xcall) || isSolanaCall(props.xcall)) &&
          props.xcallMeta ? (
          <ReviewTransactionXCallForm
            xcall={props.xcall}
            xcallMeta={props.xcallMeta}
            onCancel={onClose}
            onEvmSigned={(data) => {
              props.onSubmitted?.()
              sendEvmTx(data)
            }}
            onSolanaSigned={(data) => {
              props.onSubmitted?.()
              sendSolanaTx(data)
            }}
            onSignError={setSignError}
            isLoading={isLoading}
          />
        ) : null}
      </Modal>
      <WalletUpgradeModal />
    </>
  )
}
