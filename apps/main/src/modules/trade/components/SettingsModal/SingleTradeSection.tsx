import { FormError } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { SettingsSection } from "@/modules/trade/components/SettingsModal/SettingsSection"
import { TradeSlippage } from "@/modules/trade/components/SettingsModal/TradeSlippage"
import { TradeSettings } from "@/states/tradeSettings"

export const SingleTradeSection: FC = () => {
  const { t } = useTranslation("trade")
  const { control } = useFormContext<TradeSettings>()

  return (
    <SettingsSection label={t("swap.settings.modal.option.single")}>
      <Controller
        control={control}
        name="single.swapSlippage"
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <div>
            <TradeSlippage
              slippage={value}
              onSlippageChange={(swapSlippage) => onChange(swapSlippage)}
              helpTooltip={t("swap.settings.modal.single.slippage.help")}
              description={t("swap.settings.modal.single.slippage.description")}
            />
            {error && (
              <FormError sx={{ textAlign: "end" }}>{error.message}</FormError>
            )}
          </div>
        )}
      />
    </SettingsSection>
  )
}
