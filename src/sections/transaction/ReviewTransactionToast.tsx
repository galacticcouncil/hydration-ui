import React, { useEffect, useRef } from "react"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { UseMutationResult } from "@tanstack/react-query"
import { useToast } from "state/toasts"
import { ButtonTransparent } from "components/Button/Button"

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
        children: (
          <Text fs={12}>{t("pools.reviewTransaction.toast.success")}</Text>
        ),
      })

      closeRef.current?.()
    }

    let toRemoveId: string | undefined = undefined
    if (isError) {
      toRemoveId = toastRef.current.error({
        persist: true,
        children: (
          <div sx={{ flex: "row" }}>
            <Text fs={12}>{t("pools.reviewTransaction.toast.error")}</Text>
            <ButtonTransparent
              type="button"
              sx={{
                p: "0 15px",
                lineHeight: 12,
                fontSize: 12,
                color: "brightBlue300",
              }}
              onClick={() => reviewRef.current?.()}
            >
              {t("pools.reviewTransaction.modal.error.review")}
            </ButtonTransparent>
          </div>
        ),
      })
    }

    if (isLoading) {
      toRemoveId = toastRef.current.loading({
        persist: true,
        children: (
          <Text fs={12}>{t("pools.reviewTransaction.toast.pending")}</Text>
        ),
      })
    }

    return () => {
      if (toRemoveId) toastRef.current.remove(toRemoveId)
    }
  }, [t, isError, isSuccess, isLoading])

  return null
}
