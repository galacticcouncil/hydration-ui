import { ChevronRight } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
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
      <Text fs={[12, 14]} sx={{ mt: 8 }} align="center">
        Last connected
      </Text>
      <Flex color={getToken("text.tint.primary")} gap={4} align="center">
        <Text fs={[12, 13]}>Continue</Text>
        <Icon size={14} component={ChevronRight} />
      </Flex>
    </SProviderButton>
  )
}
