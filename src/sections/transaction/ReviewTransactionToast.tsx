import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useToast } from "state/toasts"
import { ToastMessage } from "state/store"

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
  bridge: string | undefined
  txHash: string
}) {
  const toast = useToast()
  const { t } = useTranslation()

  const { isError, isSuccess, isLoading, error, txHash } = props
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
        txHash,
      })

      closeRef.current?.()
    }

    let toRemoveId: string | undefined = undefined

    if (isError) {
      toastRef.current.error({
        link: props.link,
        title: props.toastMessage?.onError ?? (
          <p>{t("liquidity.reviewTransaction.toast.error")}</p>
        ),
        txHash,
      })

      closeRef.current?.()
    }

    if (isLoading) {
      toRemoveId = toastRef.current.loading({
        link: props.link,
        title: props.toastMessage?.onLoading ?? (
          <p>{t("liquidity.reviewTransaction.toast.pending")}</p>
        ),
        bridge: props.bridge || undefined,
        txHash,
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
    txHash,
  ])

  return null
}
