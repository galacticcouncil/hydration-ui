import { Flex, Text, Toggle } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SettingLabel } from "@/modules/trade/swap/components/SettingsModal/SettingLabel"
import { SettingsSection } from "@/modules/trade/swap/components/SettingsModal/SettingsSection"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useIntentsStore } from "@/states/intents"

export const TradeExecutionSection: FC = () => {
  const { t } = useTranslation("trade")
  const { featureFlags } = useRpcProvider()
  const enabled = useIntentsStore((state) => state.enabled)
  const setEnabled = useIntentsStore((state) => state.setEnabled)

  if (!featureFlags.isIceEnabled) {
    return null
  }

  return (
    <SettingsSection label={t("swap.settings.modal.option.execution")}>
      <Flex direction="column" gap="s">
        <Flex justify="space-between" align="center" py="s">
          <SettingLabel label={t("swap.settings.modal.intents.label")} />
          <Toggle checked={enabled} onCheckedChange={setEnabled} />
        </Flex>
        <Text fs="p5" lh={1.3} color={getToken("text.medium")}>
          {t("swap.settings.modal.intents.description")}
        </Text>
      </Flex>
    </SettingsSection>
  )
}
