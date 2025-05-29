import {
  ChevronRight,
  Download,
  LogOut,
} from "@galacticcouncil/ui/assets/icons"
import { Box, Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { openUrl } from "@galacticcouncil/utils"
import { useCallback } from "react"
import { countBy, pick, prop } from "remeda"
import { useShallow } from "zustand/shallow"

import {
  SAccountIndicator,
  SConnectionIndicator,
  SProviderButton,
} from "@/components/Web3ConnectProviderButton.styled"
import { EVM_PROVIDERS } from "@/config/providers"
import { useWeb3Connect, WalletProviderStatus } from "@/hooks/useWeb3Connect"
import { useWeb3Enable } from "@/hooks/useWeb3Enable"
import { WalletData } from "@/types/wallet"

export type Web3ConnectProviderButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & WalletData

export const Web3ConnectProviderButton: React.FC<
  Web3ConnectProviderButtonProps
> = ({ title, logo, installed, provider, installUrl, ...props }) => {
  const { enable, disconnect } = useWeb3Enable()

  const { getStatus, accounts } = useWeb3Connect(
    useShallow(pick(["accounts", "getStatus"])),
  )

  const isConnected = getStatus(provider) === WalletProviderStatus.Connected

  const accountsCount = countBy(accounts, prop("provider"))[provider] || 0

  const onClick = useCallback(() => {
    if (isConnected) {
      disconnect(provider)
    } else if (installed) {
      enable(provider)
    } else {
      openUrl(installUrl)
    }
  }, [disconnect, enable, installUrl, installed, isConnected, provider])

  return (
    <SProviderButton type="button" {...props} onClick={onClick}>
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
      {accountsCount > 0 && (
        <SAccountIndicator>+{accountsCount}</SAccountIndicator>
      )}
    </SProviderButton>
  )
}
