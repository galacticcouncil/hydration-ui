import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { UseMutationResult } from "@tanstack/react-query"
import { useToast } from "state/toasts"
import { ToastMessage } from "state/store"
import { getTransactionLink } from "../../api/transaction"

export function ReviewTransactionToast<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>(props: {
  id: string
  hash: string
  mutation: UseMutationResult<TData, TError, TVariables, TContext>
  onReview?: () => void
  onClose?: () => void
  toastMessage?: ToastMessage
}) {
  const toast = useToast()
  const { t } = useTranslation()
  const { isError, isSuccess, isLoading } = props.mutation
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
        link: getTransactionLink(props.hash),
      })

      closeRef.current?.()
    }

    let toRemoveId: string | undefined = undefined
    if (isError) {
      toastRef.current.error({
        title: props.toastMessage?.onError ?? (
          <p>{t("liquidity.reviewTransaction.toast.error")}</p>
        ),
        link: getTransactionLink(props.hash),
      })
    }

    if (isLoading) {
      toRemoveId = toastRef.current.loading({
        title: props.toastMessage?.onLoading ?? (
          <p>{t("liquidity.reviewTransaction.toast.pending")}</p>
        ),
        link: getTransactionLink(props.hash),
      })
    }

    return () => {
      if (toRemoveId) toastRef.current.remove(toRemoveId)
    }
  }, [t, props.toastMessage, isError, isSuccess, isLoading, props.hash])

  return null
}
