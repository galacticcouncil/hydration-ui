import { ChevronRight } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Users } from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  SAccountIndicator,
  SProviderButton,
} from "@/components/provider/ProviderButton.styled"
import { Web3ConnectModalPage } from "@/config/modal"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { useMultisigConfigs } from "@/hooks/useMultisigConfigs"

export const ProviderMultisigButton = () => {
  const { t } = useTranslation()
  const { setPage } = useWeb3ConnectContext()

  const configs = useMultisigConfigs()

  return (
    <SProviderButton
      type="button"
      onClick={() =>
        setPage(
          configs.length > 0
            ? Web3ConnectModalPage.MultisigConfigSelect
            : Web3ConnectModalPage.MultisigSetup,
        )
      }
    >
      <Icon size="xl" component={Users} />
      <Text fs={["p5", "p4"]} align="center" mt="base">
        {t("multisig.title", "Multisig")}
      </Text>
      <Flex
        color={getToken("text.tint.primary")}
        gap="s"
        align="center"
        justify="center"
      >
        <Text fs="p5" align="center">
          {configs.length > 0
            ? t("provider.continue")
            : t("multisig.setup.short")}
        </Text>
        <Icon size="s" component={ChevronRight} />
      </Flex>
      {configs.length > 0 && (
        <SAccountIndicator>+{configs.length}</SAccountIndicator>
      )}
    </SProviderButton>
  )
}
