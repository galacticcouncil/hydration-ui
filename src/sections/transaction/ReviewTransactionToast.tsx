import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { UseMutationResult } from "@tanstack/react-query"
import { useToast } from "state/toasts"
import { Button } from "components/Button/Button"

export function ReviewTransactionToast<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>(props: {
  id: string
  mutation: UseMutationResult<TData, TError, TVariables, TContext>
  onReview?: () => void
  onClose?: () => void
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
        title: t("pools.reviewTransaction.toast.success"),
      })

      closeRef.current?.()
    }

    let toRemoveId: string | undefined = undefined
    if (isError) {
      toRemoveId = toastRef.current.error({
        persist: true,
        title: t("pools.reviewTransaction.toast.error"),
        actions: (
          <Button
            type="button"
            variant="transparent"
            size="small"
            sx={{ p: "0 15px", lineHeight: 12 }}
            onClick={() => reviewRef.current?.()}
          >
            {t("pools.reviewTransaction.modal.error.review")}
          </Button>
        ),
      })
    }

    if (isLoading) {
      toRemoveId = toastRef.current.loading({
        persist: true,
        title: t("pools.reviewTransaction.toast.pending"),
      })
    }

    return () => {
      if (toRemoveId) toastRef.current.remove(toRemoveId)
    }
  }, [t, isError, isSuccess, isLoading])

  return null
}
