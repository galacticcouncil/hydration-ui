import { LoadingButton } from "@galacticcouncil/ui/components"
import { FC, ReactNode } from "react"
import { useFormContext, useFormState } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { TradeFormValues } from "@/modules/trade/swap/lib/useTradeForm"
import { maxBalanceError } from "@/utils/validators"

type Props = {
  readonly isEnabled: boolean
  readonly isLoading: boolean
  readonly disabledLabel?: ReactNode
  readonly children: ReactNode
}

export const TradeFormSubmit: FC<Props> = ({
  isEnabled,
  isLoading,
  disabledLabel,
  children,
}) => {
  const { t } = useTranslation("trade")
  const { control, watch } = useFormContext<TradeFormValues>()
  const { errors, isValid } = useFormState({ control, name: "sellAmount" })
  const sellAmount = watch("sellAmount")

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
        isLoading={isLoading}
        disabled={!isEnabled}
        variant={isEnabled ? "primary" : "muted"}
        loadingVariant="muted"
        loadingMode={isValid ? "inline" : "replace"}
      >
        {label}
      </LoadingButton>
    </AuthorizedAction>
  )
}
