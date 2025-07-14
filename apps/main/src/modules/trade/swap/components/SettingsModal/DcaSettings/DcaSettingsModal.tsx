import {
  Flex,
  FormError,
  ModalBody,
  ModalHeader,
  NumberInput,
} from "@galacticcouncil/ui/components"
import { preventDefault } from "@galacticcouncil/utils"
import { FC } from "react"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useDcaSettingsForm } from "@/modules/trade/swap/components/SettingsModal/DcaSettings/useDcaSettingsForm"
import { SettingLabel } from "@/modules/trade/swap/components/SettingsModal/SettingLabel"
import { SettingsSection } from "@/modules/trade/swap/components/SettingsModal/SettingsSection"
import { TradeSlippage } from "@/modules/trade/swap/components/SettingsModal/TradeSlippage"
import { useTradeSettings } from "@/states/tradeSettings"

export const DcaSettingsModal: FC = () => {
  const { t } = useTranslation("trade")

  const { update, ...tradeSettings } = useTradeSettings()
  const form = useDcaSettingsForm(tradeSettings.dca, (dca) =>
    update({ ...tradeSettings, dca }),
  )

  return (
    <FormProvider {...form}>
      <ModalHeader
        title={t("dca.settings.modal.title")}
        description={t("dca.settings.modal.description")}
      />
      <ModalBody sx={{ minHeight: ["auto", 400], pt: 0 }}>
        <form onSubmit={preventDefault}>
          <SettingsSection label="">
            <Controller
              control={form.control}
              name="slippage"
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <>
                  <TradeSlippage
                    slippage={value}
                    onSlippageChange={onChange}
                    helpTooltip={t("dca.settings.modal.slippage.help")}
                    isError={!!error}
                  />
                  {error && (
                    <FormError sx={{ textAlign: "end" }}>
                      {error.message}
                    </FormError>
                  )}
                </>
              )}
            />
            <Controller
              control={form.control}
              name="maxRetries"
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <div>
                  <Flex justify="space-between" align="center">
                    <SettingLabel
                      label={t("dca.settings.modal.maxRetries")}
                      helpTooltip={t("dca.settings.modal.maxRetries.help")}
                    />
                    <NumberInput
                      sx={{ width: 85 }}
                      value={value}
                      allowNegative={false}
                      decimalScale={0}
                      isError={!!error}
                      onValueChange={({ floatValue }) =>
                        onChange(floatValue ?? null)
                      }
                    />
                  </Flex>
                  {error && (
                    <FormError sx={{ textAlign: "end" }}>
                      {error.message}
                    </FormError>
                  )}
                </div>
              )}
            />
          </SettingsSection>
        </form>
      </ModalBody>
    </FormProvider>
  )
}
