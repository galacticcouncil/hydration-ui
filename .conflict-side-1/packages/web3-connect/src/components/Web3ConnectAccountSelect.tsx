import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Grid,
  Input,
  ModalBody,
  ModalHeader,
  Text,
} from "@galacticcouncil/ui/components"
import { useCallback, useMemo, useState } from "react"
import { useDebounce } from "react-use"
import { pick, prop } from "remeda"
import { useShallow } from "zustand/react/shallow"

import { Web3ConnectAccount } from "@/components/Web3ConnectAccount"
import { getFilteredAccounts } from "@/components/Web3ConnectAccountSelect.utils"
import { Web3ConnectModeFilter } from "@/components/Web3ConnectModeFilter"
import { Web3ConnectProviderLoader } from "@/components/Web3ConnectProviderLoader"
import { useAccount } from "@/hooks/useAccount"
import { Account, useWeb3Connect, WalletMode } from "@/hooks/useWeb3Connect"
import { getWallet } from "@/wallets"
import { BaseSubstrateWallet } from "@/wallets/BaseSubstrateWallet"

export const Web3ConnectAccountSelect = () => {
  const { account: currentAccount } = useAccount()
  const { accounts, setAccount, toggle, getConnectedProviders } =
    useWeb3Connect(
      useShallow(
        pick(["accounts", "setAccount", "toggle", "getConnectedProviders"]),
      ),
    )

  const [filter, setFilter] = useState<WalletMode>(WalletMode.Default)
  const [searchVal, setSearchVal] = useState("")
  const [search, setSearch] = useState("")
  useDebounce(
    () => {
      setSearch(searchVal ?? "")
    },
    100,
    [searchVal],
  )

  const providers = getConnectedProviders()
  const isProvidersConnecting = providers.some(
    ({ status }) => status === "pending",
  )

  const accountList = useMemo(
    () => getFilteredAccounts(accounts, currentAccount, search, filter),
    [accounts, currentAccount, filter, search],
  )

  const shouldRenderFilters = !isProvidersConnecting && accounts.length > 1
  const hasNoResults = accountList.length === 0

  const onAccountSelect = useCallback(
    (account: Account) => {
      setAccount(account)
      toggle()

      const wallet = getWallet(account.provider)
      if (wallet instanceof BaseSubstrateWallet) {
        wallet.setSigner(account.address)
      }
    },
    [setAccount, toggle],
  )

  return (
    <>
      <ModalHeader
        title="Select account"
        customHeader={
          shouldRenderFilters && (
            <Flex direction="column" gap={20} mt={10}>
              <Input
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                customSize="large"
                iconStart={Search}
                placeholder="Search by name or paste address"
              />
              <Web3ConnectModeFilter
                active={filter}
                onSetActive={(mode) => setFilter(mode)}
                blacklist={[WalletMode.Solana]}
              />
            </Flex>
          )
        }
      />
      <ModalBody>
        <Grid gap={10}>
          {isProvidersConnecting ? (
            <Web3ConnectProviderLoader
              providers={providers.map(prop("type"))}
            />
          ) : (
            <>
              {hasNoResults && <Text>No accounts found</Text>}
              {accountList.map((account) => (
                <Web3ConnectAccount
                  key={`${account.address}-${account.provider}`}
                  {...account}
                  onSelect={onAccountSelect}
                />
              ))}
            </>
          )}
        </Grid>
      </ModalBody>
    </>
  )
}
