import {
  Collapsible,
  Grid,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { openUrl } from "@galacticcouncil/utils"
import { useState } from "react"

import {
  AccountFilter,
  AccountFilterOption,
} from "@/components/account/AccountFilter"
import { ProviderButton } from "@/components/provider/ProviderButton"
import { ProviderConnectAll } from "@/components/provider/ProviderConnectAll"
import { ProviderExternalButton } from "@/components/provider/ProviderExternalButton"
import { ProviderInstalledButton } from "@/components/provider/ProviderInstalledButton"
import { ProviderLastConnectedButton } from "@/components/provider/ProviderLastConnectedButton"
import { Web3ConnectModalPage } from "@/config/modal"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { useWalletProviders } from "@/hooks/useWalletProviders"
import { WalletMode } from "@/hooks/useWeb3Connect"
import { getDefaultAccountFilterByMode } from "@/utils"
import { getWalletData } from "@/wallets"

export const ProviderSelect = () => {
  const { setPage, mode } = useWeb3ConnectContext()

  const [filter, setFilter] = useState<AccountFilterOption>(
    getDefaultAccountFilterByMode(mode),
  )

  const isDefaultMode = mode === WalletMode.Default

  const { installed, other } = useWalletProviders(isDefaultMode ? filter : mode)

  return (
    <Stack gap={10}>
      {isDefaultMode && (
        <AccountFilter active={filter} onSetActive={setFilter} />
      )}
      <Collapsible
        label={<Text fs="p3">Installed & recently used</Text>}
        actionLabel="Show"
        actionLabelWhenOpen="Hide"
        defaultOpen
      >
        <Grid columns={[2, 4]} gap={10}>
          {isDefaultMode && (
            <ProviderLastConnectedButton
              onClick={() => setPage(Web3ConnectModalPage.AccountSelect)}
            />
          )}
          {installed.map(getWalletData).map((props) => (
            <ProviderInstalledButton key={props.provider} {...props} />
          ))}
          {isDefaultMode && <ProviderExternalButton />}
        </Grid>
        {isDefaultMode && <ProviderConnectAll installed={installed} />}
      </Collapsible>
      {other.length > 0 && (
        <>
          <Separator />
          <Collapsible
            label={<Text fs="p3">Other Wallets</Text>}
            actionLabel="Show"
            actionLabelWhenOpen="Hide"
            defaultOpen={installed.length === 0}
          >
            <Grid columns={[2, 4]} gap={10}>
              {other.map(getWalletData).map((props) => (
                <ProviderButton
                  key={props.provider}
                  {...props}
                  onClick={() => openUrl(props.installUrl)}
                  actionLabel="Download"
                />
              ))}
            </Grid>
          </Collapsible>
        </>
      )}
    </Stack>
  )
}
