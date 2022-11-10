import React, { useState } from "react"
import { Modal } from "components/Modal/Modal"
import { useTranslation } from "react-i18next"
import { Transaction } from "state/store"
import { useMutation } from "@tanstack/react-query"
import { SubmittableExtrinsic } from "@polkadot/api/types"
import { ComponentProps } from "react"

import { ReviewTransactionPending } from "./ReviewTransactionPending"
import { ReviewTransactionSuccess } from "./ReviewTransactionSuccess"
import { ReviewTransactionError } from "./ReviewTransactionError"
import { ReviewTransactionForm } from "./ReviewTransactionForm"
import { useApiPromise } from "utils/api"
import { ISubmittableResult } from "@polkadot/types/types"
import { ReviewTransactionToast } from "./ReviewTransactionToast"

export const ReviewTransaction: React.FC<Transaction> = (props) => {
  const { t } = useTranslation()
  const api = useApiPromise()
  const [minimizeModal, setMinimizeModal] = useState(false)

  const sendTx = useMutation(async (sign: SubmittableExtrinsic<"promise">) => {
    return await new Promise<ISubmittableResult>(async (resolve, reject) => {
      const unsubscribe = await sign.send((result) => {
        if (!result || !result.status) return
        if (result.isCompleted) {
          if (result.dispatchError) {
            let errorMessage = result.dispatchError.toString()

            if (result.dispatchError.isModule) {
              const decoded = api.registry.findMetaError(
                result.dispatchError.asModule,
              )
              errorMessage = `${decoded.section}.${
                decoded.method
              }: ${decoded.docs.join(" ")}`
            }

            reject(new Error(errorMessage))
          } else {
            resolve(result)
          }

          unsubscribe()
        }
      })
    })
  })

  const modalProps: Partial<ComponentProps<typeof Modal>> =
    sendTx.isLoading || sendTx.isSuccess || sendTx.isError
      ? {
          width: 460,
          title: undefined,
          variant: sendTx.isError ? "error" : "default",
          withoutClose: sendTx.isLoading,
        }
      : {
          title: t("pools.reviewTransaction.modal.title"),
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
          onReview={onReview}
          onClose={handleClose}
        />
      )}
      <Modal open={!minimizeModal} onClose={handleClose} {...modalProps}>
        {sendTx.isLoading ? (
          <ReviewTransactionPending onClose={handleClose} />
        ) : sendTx.isSuccess ? (
          <ReviewTransactionSuccess onClose={handleClose} />
        ) : sendTx.isError ? (
          <ReviewTransactionError onClose={handleClose} onReview={onReview} />
        ) : (
          <ReviewTransactionForm
            tx={props.tx}
            hash={props.hash}
            title={props.title}
            onCancel={handleClose}
            onSigned={(signed) => sendTx.mutateAsync(signed)}
          />
        )}
      </Modal>
    </>
  )
}
