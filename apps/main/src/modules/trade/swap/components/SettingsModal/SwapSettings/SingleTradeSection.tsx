import { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { SettingsSection } from "@/modules/trade/swap/components/SettingsModal/SettingsSection"
import { TradeSlippage } from "@/modules/trade/swap/components/SettingsModal/TradeSlippage"
import { SwapSettings } from "@/states/tradeSettings"

export const SingleTradeSection: FC = () => {
  const { t } = useTranslation("trade")
  const { control } = useFormContext<SwapSettings>()

  return (
    <SettingsSection label={t("swap.settings.modal.option.single")}>
      <Controller
        control={control}
        name="single.swapSlippage"
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <TradeSlippage
            slippage={value}
            onSlippageChange={onChange}
            description={t("swap.settings.modal.single.slippage.description")}
            error={error?.message}
          />
        )}
      />
    </SettingsSection>
  )
}
