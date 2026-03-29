import { ChevronRight } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Users } from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  SConnectionIndicator,
  SProviderButton,
} from "@/components/provider/ProviderButton.styled"
import { Web3ConnectModalPage } from "@/config/modal"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { useMultisigStore } from "@/hooks/useMultisigStore"

export const ProviderMultisigButton = () => {
  const { t } = useTranslation()
  const { setPage } = useWeb3ConnectContext()
  const { activeConfigId, getActiveConfig } = useMultisigStore()

  const isActive = !!activeConfigId
  const activeConfig = isActive ? getActiveConfig() : null

  return (
    <SProviderButton
      type="button"
      onClick={() => setPage(Web3ConnectModalPage.MultisigSetup)}
    >
      <Icon size="xl" component={Users} />
      <Text fs={["p5", "p4"]} align="center" mt="base">
        {t("multisig.title", "Multisig")}
      </Text>
      <Flex
        color={getToken("text.tint.primary")}
        gap="s"
        align="center"
      >
        <Text fs="p5">
          {isActive && activeConfig
            ? `${activeConfig.name || t("multisig.title", "Multisig")} (${activeConfig.threshold}/${activeConfig.signers.length})`
            : t("multisig.setup.short", "Setup")}
        </Text>
        <Icon size="s" component={ChevronRight} />
      </Flex>
      {isActive && <SConnectionIndicator />}
    </SProviderButton>
  )
}
