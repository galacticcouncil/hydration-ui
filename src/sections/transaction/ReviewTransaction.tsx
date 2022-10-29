import React from "react"
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

export const ReviewTransaction: React.FC<Transaction> = (props) => {
  const { t } = useTranslation()
  const api = useApiPromise()

  const sendTx = useMutation(async (sign: SubmittableExtrinsic<"promise">) => {
    return await new Promise<ISubmittableResult>((resolve, reject) => {
      sign.send((self) => {
        if (self.isCompleted) {
          if (self.dispatchError) {
            let errorMessage = self.dispatchError.toString()

            if (self.dispatchError.isModule) {
              const decoded = api.registry.findMetaError(
                self.dispatchError.asModule,
              )
              errorMessage = `${decoded.section}.${
                decoded.method
              }: ${decoded.docs.join(" ")}`
            }

            reject(new Error(errorMessage))
          } else {
            resolve(self)
          }
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
    if (sendTx.isSuccess) {
      props.onSuccess?.(sendTx.data)
    } else {
      props.onError?.()
    }
  }

  return (
    <Modal open={true} onClose={handleClose} {...modalProps}>
      {sendTx.isLoading ? (
        <ReviewTransactionPending />
      ) : sendTx.isSuccess ? (
        <ReviewTransactionSuccess onClose={handleClose} />
      ) : sendTx.isError ? (
        <ReviewTransactionError
          onClose={handleClose}
          onReview={() => sendTx.reset()}
        />
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
  )
}
