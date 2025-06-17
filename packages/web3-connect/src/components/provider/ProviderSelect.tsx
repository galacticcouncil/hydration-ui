import { Box, Grid, Stack, Text } from "@galacticcouncil/ui/components"
import { isNot, prop } from "remeda"

import { ProviderButton } from "@/components/provider/ProviderButton"
import { SProviderButton } from "@/components/provider/ProviderButton.styled"
import { ProviderExternalButton } from "@/components/provider/ProviderExternalButton"
import { ProviderIcons } from "@/components/provider/ProviderIcons"
import { ProviderInstalledButton } from "@/components/provider/ProviderInstalledButton"
import { Web3ConnectModalPage } from "@/config/modal"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import {
  COMPATIBLE_WALLET_PROVIDERS,
  useWeb3Connect,
  WalletMode,
} from "@/hooks/useWeb3Connect"
import { useWeb3Enable } from "@/hooks/useWeb3Enable"
import { getWalletData, getWallets } from "@/wallets"

export const ProviderSelect = () => {
  const { setPage } = useWeb3ConnectContext()
  const { enable } = useWeb3Enable()
  const { getConnectedProviders, mode } = useWeb3Connect()

  const providers = getConnectedProviders()

  const wallets = Object.groupBy(getWallets(), (wallet) =>
    wallet?.installed ? "installed" : "other",
  )

  const installed = wallets?.installed || []
  const other = wallets?.other || []

  const installedCompatible = installed.filter(({ provider }) =>
    COMPATIBLE_WALLET_PROVIDERS.includes(provider),
  )

  const disabledCompatible = installedCompatible.filter(isNot(prop("enabled")))

  const enableCompatible = async () => {
    await Promise.all(
      disabledCompatible.map(({ provider }) => enable(provider)),
    )
  }
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
            <ProviderInstalledButton key={props.provider} {...props} />
          ))}
          <ProviderExternalButton />
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
