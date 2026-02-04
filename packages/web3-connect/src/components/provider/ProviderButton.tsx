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
  SProviderLink,
} from "@/components/provider/ProviderButton.styled"
import { WalletMode } from "@/hooks/useWeb3Connect"
import { WalletData } from "@/types/wallet"
import { getWalletModeIcon, getWalletModesByProviderType } from "@/utils/wallet"

export type ProviderButtonOwnProps = {
  walletData: WalletData
  isConnected?: boolean
  accountCount?: number
  actionLabel?: string
}

type AsButtonProps = {
  as: "button"
  onClick: React.MouseEventHandler<HTMLButtonElement>
}

type AsLinkProps = {
  as: "a"
  href: string
  target?: React.HTMLAttributeAnchorTarget
}

export type ProviderButtonProps = ProviderButtonOwnProps &
  (AsButtonProps | AsLinkProps)

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
  walletData,
  isConnected,
  accountCount = 0,
  actionLabel,
  ...props
}) => {
  const { logo, title, installed, provider } = walletData
  const modes = getWalletModesByProviderType(provider)

  const content = (
    <>
      <Box sx={{ position: "relative" }}>
        <img sx={{ size: "xl" }} src={logo} alt={title} />
        {modes.filter(hasModeIcon).map((mode) => (
          <Box
            sx={{ position: "absolute", bottom: -4, right: -4 }}
            borderRadius="full"
            bg={getToken("surfaces.themeBasePalette.background")}
            key={mode}
          >
            <img sx={{ size: "xs" }} src={getWalletModeIcon(mode)} />
          </Box>
        ))}
      </Box>
      <Text fs={["p5", "p4"]} align="center" mt="base">
        {title}
      </Text>
      <Flex
        color={getToken(isConnected ? "text.medium" : "text.tint.primary")}
        gap="s"
        align="center"
      >
        <Text fs="p5">{actionLabel}</Text>
        <Icon
          size="s"
          component={isConnected ? LogOut : installed ? ChevronRight : Download}
        />
      </Flex>
      {isConnected && <SConnectionIndicator />}
      {accountCount > 0 && (
        <SAccountIndicator>+{accountCount}</SAccountIndicator>
      )}
    </>
  )

  if (props.as === "a") {
    return (
      <SProviderLink href={props.href} target={props.target}>
        {content}
      </SProviderLink>
    )
  }

  return (
    <SProviderButton type="button" onClick={props.onClick}>
      {content}
    </SProviderButton>
  )
}
