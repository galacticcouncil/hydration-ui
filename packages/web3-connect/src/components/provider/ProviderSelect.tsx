import {
  Collapsible,
  Grid,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { useState } from "react"
import { isNot, prop } from "remeda"

import {
  AccountFilter,
  AccountFilterOption,
} from "@/components/account/AccountFilter"
import { ProviderButton } from "@/components/provider/ProviderButton"
import { SProviderButton } from "@/components/provider/ProviderButton.styled"
import { ProviderExternalButton } from "@/components/provider/ProviderExternalButton"
import { ProviderInstalledButton } from "@/components/provider/ProviderInstalledButton"
import { ProviderLastConnectedButton } from "@/components/provider/ProviderLastConnectedButton"
import { Web3ConnectModalPage } from "@/config/modal"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { useWalletProviders } from "@/hooks/useWalletProviders"
import {
  COMPATIBLE_WALLET_PROVIDERS,
  useWeb3Connect,
  WalletMode,
} from "@/hooks/useWeb3Connect"
import { useWeb3Enable } from "@/hooks/useWeb3Enable"
import { getWalletData } from "@/wallets"

export const ProviderSelect = () => {
  const { setPage } = useWeb3ConnectContext()
  const { enable } = useWeb3Enable()
  const mode = useWeb3Connect((state) => state.mode)

  const [filter, setFilter] = useState<AccountFilterOption>(WalletMode.Default)
  const { installed, other } = useWalletProviders(filter)

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
    <Stack gap={10}>
      <AccountFilter active={filter} onSetActive={setFilter} />
      <Collapsible
        label={<Text fs="p3">Installed & recently used</Text>}
        actionLabel="Show"
        actionLabelWhenOpen="Hide"
        defaultOpen
      >
        <Grid columns={[2, 4]} gap={10}>
          {mode === WalletMode.Default && (
            <ProviderLastConnectedButton
              onClick={() => setPage(Web3ConnectModalPage.AccountSelect)}
            />
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
      </Collapsible>
      <Separator />
      <Collapsible
        label={<Text fs="p3">Other Wallets</Text>}
        actionLabel="Show"
        actionLabelWhenOpen="Hide"
        defaultOpen={installedCompatible.length === 0}
      >
        <Grid columns={[2, 4]} gap={10}>
          {other.map(getWalletData).map((props) => (
            <ProviderButton key={props.provider} {...props} />
          ))}
        </Grid>
      </Collapsible>
    </Stack>
  )
}
