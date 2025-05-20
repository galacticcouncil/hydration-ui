import { Flex, FormError, Input } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { SettingLabel } from "@/modules/trade/components/SettingsModal/SettingLabel"
import { SettingsSection } from "@/modules/trade/components/SettingsModal/SettingsSection"
import { TradeSlippage } from "@/modules/trade/components/SettingsModal/TradeSlippage"
import { TradeSettings } from "@/states/tradeSettings"

export const SplitTradeSection: FC = () => {
  const { t } = useTranslation("trade")
  const { control } = useFormContext<TradeSettings>()

  return (
    <SettingsSection label={t("swap.settings.modal.option.split")}>
      <Controller
        control={control}
        name="split.twapSlippage"
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <>
            <TradeSlippage
              slippage={value}
              onSlippageChange={(twapSlippage) => onChange(twapSlippage)}
              helpTooltip={t("swap.settings.modal.split.slippage.help")}
            />
            {error && (
              <FormError sx={{ textAlign: "end" }}>{error.message}</FormError>
            )}
          </>
        )}
      />
      <Controller
        control={control}
        name="split.twapMaxRetries"
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <div>
            <Flex justify="space-between" align="center">
              <SettingLabel
                label={t("swap.settings.modal.split.maxRetries")}
                helpTooltip={t("swap.settings.modal.split.maxRetries.help")}
              />
              <Input
                sx={{ width: 85 }}
                value={value}
                onChange={(e) => {
                  const value = Number(e.target.value)

                  if (!isNaN(value)) {
                    onChange(value)
                  }
                }}
              />
            </Flex>
            {error && (
              <FormError sx={{ textAlign: "end" }}>{error.message}</FormError>
            )}
          </div>
        )}
      />
    </SettingsSection>
  )
}
