import { ChevronRight } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"
import { prop } from "remeda"

import { SProviderButton } from "@/components/provider/ProviderButton.styled"
import { ProviderIcons } from "@/components/provider/ProviderIcons"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { useWeb3Connect } from "@/hooks"

export type ProviderLatestConnectedButtonProps = {
  onClick: () => void
}

export const ProviderLastConnectedButton: React.FC<
  ProviderLatestConnectedButtonProps
> = ({ onClick }) => {
  const { t } = useTranslation()
  const { mode } = useWeb3ConnectContext()
  const getConnectedProviders = useWeb3Connect(
    (state) => state.getConnectedProviders,
  )

  const connectedProviders = getConnectedProviders(mode)
  const connected = connectedProviders.map(prop("type"))

  if (connected.length === 0) {
    return null
  }

  return (
    <SProviderButton type="button" onClick={onClick}>
      <ProviderIcons providers={connected} />
      <Text fs={["p5", "p4"]} sx={{ mt: 8 }} align="center">
        {t("provider.lastConnected")}
      </Text>
      <Flex color={getToken("text.tint.primary")} gap="s" align="center">
        <Text fs="p5">{t("provider.continue")}</Text>
        <Icon size="s" component={ChevronRight} />
      </Flex>
    </SProviderButton>
  )
}
