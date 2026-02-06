import {
  Collapsible,
  Grid,
  ModalContentDivider,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { useDevice } from "@galacticcouncil/utils"
import { useState } from "react"

import {
  AccountFilter,
  AccountFilterOption,
} from "@/components/account/AccountFilter"
import { ProviderButton } from "@/components/provider/ProviderButton"
import { ProviderConnectAll } from "@/components/provider/ProviderConnectAll"
import { ProviderDeeplinkedButton } from "@/components/provider/ProviderDeeplinkedButton"
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
  const { isMobileDevice } = useDevice()
  const [filter, setFilter] = useState<AccountFilterOption>(
    getDefaultAccountFilterByMode(mode),
  )

  const isDefaultMode = mode === WalletMode.Default

  const { installed, deeplinked, other } = useWalletProviders(
    isDefaultMode ? filter : mode,
  )

  return (
    <Stack gap="base">
      {isDefaultMode && (
        <AccountFilter active={filter} onSetActive={setFilter} />
      )}
      <Collapsible
        label={
          <Text fs="p3">
            {isMobileDevice ? "Available wallets" : "Installed & recently used"}
          </Text>
        }
        actionLabel="Show"
        actionLabelWhenOpen="Hide"
        defaultOpen
      >
        <Grid columns={[2, 4]} gap="base">
          {isDefaultMode && (
            <ProviderLastConnectedButton
              onClick={() => setPage(Web3ConnectModalPage.AccountSelect)}
            />
          )}
          {installed.map((wallet) => {
            const data = getWalletData(wallet)
            return (
              <ProviderInstalledButton key={data.provider} walletData={data} />
            )
          })}
          {deeplinked.map((wallet) => {
            const data = getWalletData(wallet)
            return (
              <ProviderDeeplinkedButton key={data.provider} walletData={data} />
            )
          })}
          {isDefaultMode && <ProviderExternalButton />}
        </Grid>
        {isDefaultMode && !isMobileDevice && (
          <ProviderConnectAll installed={installed} />
        )}
      </Collapsible>
      {!isMobileDevice && other.length > 0 && (
        <>
          <ModalContentDivider mt="m" />
          <Collapsible
            label={<Text fs="p3">Other Wallets</Text>}
            actionLabel="Show"
            actionLabelWhenOpen="Hide"
            defaultOpen={installed.length === 0 && deeplinked.length === 0}
          >
            <Grid columns={[2, 4]} gap="base">
              {other.map((wallet) => {
                const data = getWalletData(wallet)
                return (
                  <ProviderButton
                    as="a"
                    href={data.installUrl}
                    target="_blank"
                    key={data.provider}
                    walletData={data}
                    actionLabel="Download"
                  />
                )
              })}
            </Grid>
          </Collapsible>
        </>
      )}
    </Stack>
  )
}
