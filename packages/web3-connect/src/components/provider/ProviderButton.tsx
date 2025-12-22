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
import { WalletMode } from "@/hooks/useWeb3Connect"
import { WalletData } from "@/types/wallet"
import { getWalletModeIcon, getWalletModesByProviderType } from "@/utils/wallet"

export type ProviderButtonProps = WalletData & {
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  isConnected?: boolean
  accountCount?: number
  actionLabel?: string
}

const modesWithIconsConfig = {
  [WalletMode.EVM]: true,
  [WalletMode.Solana]: true,
  [WalletMode.Sui]: true,
} as const

function hasModeIcon(
  mode: WalletMode,
): mode is keyof typeof modesWithIconsConfig {
  return mode in modesWithIconsConfig
}

export const ProviderButton: React.FC<ProviderButtonProps> = ({
  title,
  logo,
  installed,
  provider,
  onClick,
  isConnected,
  accountCount = 0,
  actionLabel,
}) => {
  const modes = getWalletModesByProviderType(provider)
  return (
    <SProviderButton type="button" onClick={onClick}>
      <Box sx={{ position: "relative" }}>
        <img width={32} height={32} src={logo} alt={title} />
        {modes.filter(hasModeIcon).map((mode) => (
          <Box
            sx={{ position: "absolute", bottom: -4, right: -4 }}
            borderRadius="full"
            bg={getToken("surfaces.themeBasePalette.background")}
            key={mode}
          >
            <img width={16} height={16} src={getWalletModeIcon(mode)} />
          </Box>
        ))}
      </Box>
      <Text fs={14} align="center" mt={10}>
        {title}
      </Text>
      <Flex
        color={getToken(isConnected ? "text.medium" : "text.tint.primary")}
        gap={4}
        align="center"
      >
        <Text fs={[12, 13]}>{actionLabel}</Text>
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
