import { Flex, Select, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { SettingLabel } from "@/modules/trade/swap/components/SettingsModal/SettingLabel"
import { SettingsSection } from "@/modules/trade/swap/components/SettingsModal/SettingsSection"
import { SwapSettingsFormValues } from "@/modules/trade/swap/components/SettingsModal/SwapSettings/useSwapSettingsForm"
import { formatXcPayoutEvery } from "@/modules/trade/swap/sections/XcTwap/utils/payout"
import { XC_PAYOUT_EVERY } from "@/states/tradeSettings"

export const IntentsTwapSection: FC = () => {
  const { t } = useTranslation("trade")
  const { control } = useFormContext<SwapSettingsFormValues>()

  return (
    <SettingsSection label={t("swap.settings.modal.option.intentsTwap")}>
      <Controller
        control={control}
        name="dca.payoutEvery"
        render={({ field: { value, onChange } }) => (
          <Flex direction="column" gap="s">
            <Flex justify="space-between" align="center" py="s">
              <SettingLabel label={t("xc.twap.payout.label")} />
              <Select
                size="medium"
                items={XC_PAYOUT_EVERY.map((option) => ({
                  key: String(option),
                  label: formatXcPayoutEvery(option),
                }))}
                value={String(value)}
                onValueChange={(key) => {
                  const option = XC_PAYOUT_EVERY.find(
                    (option) => String(option) === key,
                  )
                  if (option) onChange(option)
                }}
              />
            </Flex>
            <Text fs="p5" lh={1.3} color={getToken("text.medium")}>
              {t("xc.twap.payout.description")}
            </Text>
          </Flex>
        )}
      />
    </SettingsSection>
  )
}
