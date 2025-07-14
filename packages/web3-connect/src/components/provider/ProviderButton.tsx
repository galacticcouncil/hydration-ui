import {
  ChevronRight,
  Download,
  LogOut,
} from "@galacticcouncil/ui/assets/icons"
import { Box, Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import {
  SAccountIndicator,
  SConnectionIndicator,
  SProviderButton,
} from "@/components/provider/ProviderButton.styled"
import { EVM_PROVIDERS } from "@/config/providers"
import { WalletData } from "@/types/wallet"

export type ProviderButtonProps = WalletData & {
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  isConnected?: boolean
  accountCount?: number
}

export const ProviderButton: React.FC<ProviderButtonProps> = ({
  title,
  logo,
  installed,
  provider,
  onClick,
  isConnected,
  accountCount = 0,
}) => {
  return (
    <SProviderButton type="button" onClick={onClick}>
      <Box sx={{ position: "relative" }}>
        <img width={32} height={32} src={logo} alt={title} />
        {EVM_PROVIDERS.includes(provider) && (
          <img
            width={16}
            height={16}
            sx={{ position: "absolute", bottom: -4, right: -4 }}
            src="https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/ethereum/1/icon.svg"
          />
        )}
      </Box>
      <Text fs={14} align="center" mt={10}>
        {title}
      </Text>
      <Flex
        color={getToken(isConnected ? "text.medium" : "text.tint.primary")}
        gap={4}
        align="center"
      >
        <Text fs={[12, 13]}>
          {isConnected ? "Disconnect" : installed ? "Continue" : "Download"}
        </Text>
        <Icon
          size={14}
          component={isConnected ? LogOut : installed ? ChevronRight : Download}
        />
      </Flex>
      {isConnected && <SConnectionIndicator />}
      {accountCount > 0 && (
        <SAccountIndicator>+{accountCount}</SAccountIndicator>
      )}
    </SProviderButton>
  )
}
