import { Grid } from "@galacticcouncil/ui/components"
import { useMemo } from "react"
import { pick, prop, sortBy } from "remeda"
import { useShallow } from "zustand/react/shallow"

import { Web3ConnectAccount } from "@/components/Web3ConnectAccount"
import { Web3ConnectProviderLoader } from "@/components/Web3ConnectProviderLoader"
import { useAccount } from "@/hooks/useAccount"
import { Account, useWeb3Connect } from "@/hooks/useWeb3Connect"

const isActive = (currentAccount: Account, account: Account) => {
  return (
    currentAccount?.address === account.address &&
    currentAccount?.provider === account.provider
  )
}

export const Web3ConnectAccountSelect = () => {
  const { account: currentAccount } = useAccount()
  const { accounts, setAccount, toggle, getConnectedProviders } =
    useWeb3Connect(
      useShallow(
        pick(["accounts", "setAccount", "toggle", "getConnectedProviders"]),
      ),
    )

  const providers = getConnectedProviders()
  const isProvidersConnecting = providers.some(
    ({ status }) => status === "pending",
  )

  const accountList = useMemo(() => {
    if (!currentAccount) return accounts
    return sortBy(accounts, (account) => !isActive(currentAccount, account))
  }, [accounts, currentAccount])

  if (isProvidersConnecting) {
    return <Web3ConnectProviderLoader providers={providers.map(prop("type"))} />
  }

  return (
    <Grid gap={10}>
      {accountList.map((account) => (
        <Web3ConnectAccount
          key={`${account.address}-${account.provider}`}
          {...account}
          onSelect={(account) => {
            setAccount(account)
            toggle()
          }}
        />
      ))}
    </Grid>
  )
}
