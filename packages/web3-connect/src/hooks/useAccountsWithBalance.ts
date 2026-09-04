import { useEffect, useMemo } from "react"
import { pick, sortBy } from "remeda"
import { useShallow } from "zustand/shallow"

import { NEAR_PROVIDERS, ZCASH_PROVIDERS } from "@/config/providers"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { useAccount } from "@/hooks"
import { useAccountBalancesMap } from "@/hooks/useAccountBalancesMap"
import { Account, useWeb3Connect } from "@/hooks/useWeb3Connect"

// Neckwork prices Hydration accounts by hex public key and rejects the whole
// batch on any other id, so NEAR and Zcash accounts are left without a balance.
const hasNeckworkBalance = (account: Account) =>
  !NEAR_PROVIDERS.includes(account.provider) &&
  !ZCASH_PROVIDERS.includes(account.provider)

export const useAccountsWithBalance = (accounts: Account[]) => {
  const { account: currentAccount } = useAccount()
  const { neckwork } = useWeb3ConnectContext()
  const { setBalances } = useWeb3Connect(
    useShallow(pick(["accounts", "setBalances"])),
  )

  const pricedAccounts = useMemo(
    () => accounts.filter(hasNeckworkBalance),
    [accounts],
  )

  const { balancesMap, isLoading: areBalancesLoading } = useAccountBalancesMap({
    accounts: pricedAccounts,
    neckwork,
  })

  useEffect(() => {
    if (!areBalancesLoading) {
      setBalances(balancesMap)
    }
  }, [balancesMap, areBalancesLoading, setBalances])

  const accountsWithBalances = useMemo(() => {
    const accountsWithActive = accounts.map((account) => {
      const isActive =
        currentAccount?.address === account.address &&
        currentAccount?.provider === account.provider

      return {
        ...account,
        isActive,
      }
    })

    return sortBy(
      accountsWithActive,
      [(item) => item.isActive, "desc"],
      [(item) => item.balance === undefined, "desc"],
      [(item) => item.balance ?? 0, "desc"],
    )
  }, [accounts, currentAccount?.address, currentAccount?.provider])

  return {
    accountsWithBalances,
    areBalancesLoading,
  }
}
