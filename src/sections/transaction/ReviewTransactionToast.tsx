import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useToast } from "state/toasts"
import { ToastMessage } from "state/store"
import { UnknownTransactionState } from "./ReviewTransaction.utils"

export function ReviewTransactionToast(props: {
  id: string
  link?: string
  onReview?: () => void
  onClose?: () => void
  toastMessage?: ToastMessage
  isError: boolean
  isSuccess: boolean
  isLoading: boolean
  error: unknown
  bridge: boolean | undefined
}) {
  const toast = useToast()
  const { t } = useTranslation()

  const { isError, isSuccess, isLoading, error } = props
  const toastRef = useRef<typeof toast>(toast)
  useEffect(() => void (toastRef.current = toast), [toast])

  const reviewRef = useRef<(typeof props)["onReview"]>(props.onReview)
  useEffect(() => void (reviewRef.current = props.onReview), [props.onReview])

  const closeRef = useRef<(typeof props)["onClose"]>(props.onClose)
  useEffect(() => {
    closeRef.current = props.onClose
  }, [props.onClose, props.id])

  useEffect(() => {
    if (isSuccess && !props.bridge) {
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
          link: props.link,
          title: props.toastMessage?.onError ?? (
            <p>{t("liquidity.reviewTransaction.toast.unknown")}</p>
          ),
        })
      } else {
        toastRef.current.error({
          link: props.link,
          title: props.toastMessage?.onError ?? (
            <p>{t("liquidity.reviewTransaction.toast.error")}</p>
          ),
        })
      }
    }

    if (isLoading) {
      toRemoveId = toastRef.current.loading({
        link: props.link,
        title: props.toastMessage?.onLoading ?? (
          <p>{t("liquidity.reviewTransaction.toast.pending")}</p>
        ),
        bridge: props.bridge || undefined,
      })
    }

    return () => {
      if (toRemoveId && !props.bridge) toastRef.current.remove(toRemoveId)
    }
  }, [
    t,
    props.toastMessage,
    isError,
    error,
    isSuccess,
    isLoading,
    props.link,
    props.bridge,
  ])

  return null
}
