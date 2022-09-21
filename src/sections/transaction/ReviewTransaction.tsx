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
import { useApiPromise } from "utils/network"

type Props = {
  onCancel: () => void
  onBack?: () => void
} & Transaction

export const ReviewTransaction: React.FC<Props> = (props) => {
  const { t } = useTranslation()
  const api = useApiPromise()

  const sendTx = useMutation(async (sign: SubmittableExtrinsic<"promise">) => {
    return await new Promise((resolve, reject) => {
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
            resolve(self.txHash)
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

  return (
    <Modal open={true} onClose={props.onCancel} {...modalProps}>
      {sendTx.isLoading ? (
        <ReviewTransactionPending />
      ) : sendTx.isSuccess ? (
        <ReviewTransactionSuccess onClose={props.onCancel} />
      ) : sendTx.isError ? (
        <ReviewTransactionError
          onClose={props.onCancel}
          onReview={() => sendTx.reset()}
        />
      ) : (
        <ReviewTransactionForm
          tx={props.tx}
          hash={props.hash}
          title={props.title}
          onCancel={props.onCancel}
          onSigned={(signed) => sendTx.mutateAsync(signed)}
        />
      )}
    </Modal>
  )
}
