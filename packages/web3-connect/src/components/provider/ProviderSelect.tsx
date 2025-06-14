import { Box, Grid, Stack, Text } from "@galacticcouncil/ui/components"
import { openUrl } from "@galacticcouncil/utils"
import { useCallback, useMemo } from "react"
import { countBy, groupBy, isNot, prop } from "remeda"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { useWeb3ConnectContext } from "@/components/context/Web3ConnectContext"
import { ProviderButton } from "@/components/provider/ProviderButton"
import { SProviderButton } from "@/components/provider/ProviderButton.styled"
import { ProviderIcons } from "@/components/provider/ProviderIcons"
import { Web3ConnectModalPage } from "@/config/modal"
import { WalletProviderType } from "@/config/providers"
import {
  COMPATIBLE_WALLET_PROVIDERS,
  useWeb3Connect,
  WalletMode,
  WalletProviderStatus,
} from "@/hooks/useWeb3Connect"
import { useWeb3Enable } from "@/hooks/useWeb3Enable"
import { WalletData } from "@/types/wallet"
import { getWallet, getWalletData, getWallets } from "@/wallets"

export const ProviderSelect = () => {
  const { setPage } = useWeb3ConnectContext()
  const { enable } = useWeb3Enable()
  const { getConnectedProviders, mode } = useWeb3Connect()

  const providers = getConnectedProviders()

  const wallets = useMemo(
    () =>
      groupBy(getWallets(), (wallet) =>
        wallet?.installed ? "installed" : "other",
      ),
    [],
  )

  const installed = wallets?.installed || []
  const other = wallets?.other || []

  const installedCompatible = installed.filter(({ provider }) =>
    COMPATIBLE_WALLET_PROVIDERS.includes(provider),
  )

  const disabledCompatible = installedCompatible.filter(isNot(prop("enabled")))

  const enableCompatible = useCallback(async () => {
    await Promise.all(
      disabledCompatible.map(({ provider }) => enable(provider)),
    )
  }, [enable, disabledCompatible])

  return (
    <Stack gap={20}>
      <Box>
        <Text mb={4}>Installed</Text>
        <Grid columns={[2, 4]} gap={10}>
          {providers.length > 0 && mode === WalletMode.Default && (
            <SProviderButton
              type="button"
              onClick={() => setPage(Web3ConnectModalPage.AccountSelect)}
            >
              <ProviderIcons providers={providers.map(prop("type"))} />
              <Text fs={[12, 14]} sx={{ mt: 8 }} align="center">
                Last connected
              </Text>
            </SProviderButton>
          )}
          {installedCompatible.map(getWalletData).map((props) => (
            <InstalledProviderButton key={props.provider} {...props} />
          ))}
          <ExternalProviderWalletButton />
        </Grid>
        {disabledCompatible.length > 0 && (
          <SProviderButton
            type="button"
            sx={{ width: "100%", mt: 8, py: 10 }}
            onClick={enableCompatible}
          >
            Connect all
          </SProviderButton>
        )}
      </Box>
      <Box>
        <Text mb={4}>Other</Text>
        <Grid columns={[2, 4]} gap={10}>
          {other.map(getWalletData).map((props) => (
            <ProviderButton key={props.provider} {...props} />
          ))}
        </Grid>
      </Box>
    </Stack>
  )
}

const InstalledProviderButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & WalletData
> = (props) => {
  const { enable, disconnect } = useWeb3Enable()

  const { provider, installed, installUrl } = props

  const { getStatus, accounts } = useWeb3Connect(
    useShallow(pick(["accounts", "getStatus"])),
  )

  const isConnected = getStatus(provider) === WalletProviderStatus.Connected

  const accountCount = countBy(accounts, prop("provider"))[provider] || 0

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
    <ProviderButton
      {...props}
      onClick={onClick}
      isConnected={isConnected}
      accountCount={accountCount}
    />
  )
}

const ExternalProviderWalletButton = () => {
  const { setPage } = useWeb3ConnectContext()
  const { disconnect } = useWeb3Enable()

  const provider = WalletProviderType.ExternalWallet

  const { getStatus, accounts } = useWeb3Connect(
    useShallow(pick(["accounts", "getStatus"])),
  )

  const isConnected = getStatus(provider) === WalletProviderStatus.Connected
  const accountCount = countBy(accounts, prop("provider"))[provider] || 0

  const onClick = useCallback(() => {
    if (isConnected) {
      disconnect(provider)
    } else {
      setPage(Web3ConnectModalPage.ExternalWallet)
    }
  }, [disconnect, isConnected, provider, setPage])

  const walletData = useMemo(() => {
    const wallet = getWallet(provider)
    return wallet ? getWalletData(wallet) : null
  }, [provider])

  if (!walletData) return null

  return (
    <ProviderButton
      {...walletData}
      onClick={onClick}
      isConnected={isConnected}
      accountCount={accountCount}
    />
  )
}
