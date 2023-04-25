import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { UseMutationResult } from "@tanstack/react-query"
import { useToast } from "state/toasts"
import { ToastMessage } from "state/store"
import { UnknownTransactionState } from "./ReviewTransaction.utils"

export function ReviewTransactionToast<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>(props: {
  id: string
  mutation: UseMutationResult<TData, TError, TVariables, TContext>
  link?: string
  onReview?: () => void
  onClose?: () => void
  toastMessage?: ToastMessage
}) {
  const toast = useToast()
  const { t } = useTranslation()

  const { isError, isSuccess, isLoading, error } = props.mutation
  const toastRef = useRef<typeof toast>(toast)
  useEffect(() => void (toastRef.current = toast), [toast])

  const reviewRef = useRef<typeof props["onReview"]>(props.onReview)
  useEffect(() => void (reviewRef.current = props.onReview), [props.onReview])

  const closeRef = useRef<typeof props["onClose"]>(props.onClose)
  useEffect(() => {
    closeRef.current = props.onClose
  }, [props.onClose, props.id])

  useEffect(() => {
    if (isSuccess) {
      // toast should be still present, even if ReviewTransaction is unmounted
      toastRef.current.success({
        title: props.toastMessage?.onSuccess ?? (
          <p>{t("liquidity.reviewTransaction.toast.success")}</p>
        ),
        link: props.link,
      })

      closeRef.current?.()
    }

    let toRemoveId: string | undefined = undefined

    if (isError) {
      if (error instanceof UnknownTransactionState) {
        toastRef.current.unknown({
          title: props.toastMessage?.onError ?? (
            <p>{t("liquidity.reviewTransaction.toast.unknown")}</p>
          ),
        })
      } else {
        toastRef.current.error({
          title: props.toastMessage?.onError ?? (
            <p>{t("liquidity.reviewTransaction.toast.error")}</p>
          ),
        })
      }
    }

    if (isLoading) {
      toRemoveId = toastRef.current.loading({
        title: props.toastMessage?.onLoading ?? (
          <p>{t("liquidity.reviewTransaction.toast.pending")}</p>
        ),
      })
    }

    return () => {
      if (toRemoveId) toastRef.current.remove(toRemoveId)
    }
  }, [t, props.toastMessage, isError, error, isSuccess, isLoading, props.link])

  return null
}
