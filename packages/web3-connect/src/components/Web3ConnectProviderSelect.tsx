import { Box, Flex, Grid, Text } from "@galacticcouncil/ui/components"
import { useCallback, useMemo } from "react"
import { groupBy, prop } from "remeda"

import { Web3ConnectProviderButton } from "@/components/Web3ConnectProviderButton"
import { SProviderButton } from "@/components/Web3ConnectProviderButton.styled"
import { Web3ConnectProviderIcons } from "@/components/Web3ConnectProviderIcons"
import {
  COMPATIBLE_WALLET_PROVIDERS,
  useWeb3Connect,
  WalletMode,
} from "@/hooks/useWeb3Connect"
import { useWeb3Enable } from "@/hooks/useWeb3Enable"
import { getWalletData, getWallets } from "@/wallets"

export type Web3ConnectProviderSelectProps = {
  onLastConnectedClick: () => void
}

export const Web3ConnectProviderSelect: React.FC<
  Web3ConnectProviderSelectProps
> = ({ onLastConnectedClick }) => {
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

  const installedCompatible = installed.filter(({ provider }) => {
    return COMPATIBLE_WALLET_PROVIDERS.includes(provider)
  })

  const connectAllCompatible = useCallback(() => {
    installedCompatible.forEach(({ provider }) => {
      enable(provider)
    })
  }, [enable, installedCompatible])

  return (
    <Flex direction="column" gap={20}>
      <Box>
        <Text mb={4}>Installed</Text>
        <Grid columns={[2, 4]} gap={10}>
          {providers.length > 0 && mode === WalletMode.Default && (
            <SProviderButton onClick={onLastConnectedClick}>
              <Web3ConnectProviderIcons
                providers={providers.map(prop("type"))}
              />
              <Text fs={[12, 14]} sx={{ mt: 8 }} align="center">
                Last connected
              </Text>
            </SProviderButton>
          )}
          {installed.map(getWalletData).map((props) => (
            <Web3ConnectProviderButton
              type="button"
              key={props.provider}
              {...props}
            />
          ))}
        </Grid>
        <SProviderButton
          sx={{ width: "100%", mt: 8 }}
          onClick={connectAllCompatible}
        >
          Connect all
        </SProviderButton>
      </Box>
      <Box>
        <Text mb={4}>Other</Text>
        <Grid columns={[2, 4]} gap={10}>
          {other.map(getWalletData).map((props) => (
            <Web3ConnectProviderButton
              type="button"
              key={props.provider}
              {...props}
            />
          ))}
        </Grid>
      </Box>
    </Flex>
  )
}
