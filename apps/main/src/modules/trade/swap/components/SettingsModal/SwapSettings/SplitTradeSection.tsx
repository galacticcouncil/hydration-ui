import { Flex, FormError, NumberInput } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { SettingLabel } from "@/modules/trade/swap/components/SettingsModal/SettingLabel"
import { SettingsSection } from "@/modules/trade/swap/components/SettingsModal/SettingsSection"
import { TradeSlippage } from "@/modules/trade/swap/components/SettingsModal/TradeSlippage"
import { SwapSettings } from "@/states/tradeSettings"

export const SplitTradeSection: FC = () => {
  const { t } = useTranslation("trade")
  const { control } = useFormContext<SwapSettings>()

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
              isError={!!error}
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
              <NumberInput
                sx={{ width: 85 }}
                value={value}
                allowNegative={false}
                decimalScale={0}
                onValueChange={({ floatValue }) => onChange(floatValue ?? null)}
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
