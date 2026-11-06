import { LoadingButton } from "@galacticcouncil/ui/components"
import { FC, ReactNode, useEffect, useRef, useState } from "react"
import { useFormContext, useFormState } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { TradeFormValues } from "@/modules/trade/swap/lib/useTradeForm"
import { maxBalanceError } from "@/utils/validators"

type Props = {
  readonly isEnabled: boolean
  /** Anything that makes submitting unsafe right now, isSubmitting included. */
  readonly isLoading: boolean
  /** The order is being built or sent; clicks meanwhile are dropped. */
  readonly isSubmitting: boolean
  readonly disabledLabel?: ReactNode
  readonly children: ReactNode
}

export const TradeFormSubmit: FC<Props> = ({
  isEnabled,
  isLoading,
  isSubmitting,
  disabledLabel,
  children,
}) => {
  const { t } = useTranslation("trade")
  const { control, watch } = useFormContext<TradeFormValues>()
  const { errors, isValid } = useFormState({ control, name: "sellAmount" })
  const sellAmount = watch("sellAmount")

  // LoadingButton drops clicks while loading, and its spinner only shows after
  // a delay, so a click right after an edit (quote, health factor or derived
  // amount still recalculating) was silently ignored. Remember it and submit
  // once the form settles, with the fresh values. Clicks while submitting stay
  // dropped, so a double click cannot place two orders.
  const queuedForm = useRef<HTMLFormElement | null>(null)
  const [isQueued, setIsQueued] = useState(false)

  useEffect(() => {
    if (!isQueued || isLoading) return
    setIsQueued(false)
    if (isEnabled) queuedForm.current?.requestSubmit()
  }, [isQueued, isLoading, isEnabled])

  const label = (() => {
    if (!sellAmount) return t("xc.swap.cta.enterAmount")
    if (errors.sellAmount?.message === maxBalanceError) {
      return t("xc.swap.cta.insufficientBalance")
    }
    if (!isEnabled)
      return disabledLabel ?? (isLoading ? children : t("swap.cta.unavailable"))
    return children
  })()

  return (
    <AuthorizedAction size="large" width="100%">
      <LoadingButton
        type="submit"
        size="large"
        width="100%"
        isLoading={isLoading || isQueued}
        disabled={!isEnabled}
        disabledVariant="muted"
        loadingMode={isValid ? "inline" : "replace"}
        onClickCapture={(e) => {
          if (!isLoading || isSubmitting) return
          queuedForm.current = e.currentTarget.closest("form")
          setIsQueued(true)
        }}
      >
        {label}
      </LoadingButton>
    </AuthorizedAction>
  )
}
