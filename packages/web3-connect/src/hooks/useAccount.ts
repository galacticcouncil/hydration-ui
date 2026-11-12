import { useMemo } from "react"
import { pick } from "remeda"
import { useShallow } from "zustand/react/shallow"

import { useAccountOverride } from "@/context/AccountOverrideContext"
import { Account, useWeb3Connect } from "@/hooks/useWeb3Connect"
import { toAccount } from "@/utils"

type UseAccountReturn =
  | {
      isConnected: true
      account: Account
      accounts: Account[]
      disconnect: () => void
    }
  | {
      isConnected: false
      account: null
      accounts: []
      disconnect: () => void
    }

export const useAccount = (): UseAccountReturn => {
  const {
    account: activeAccount,
    accounts,
    disconnect,
  } = useWeb3Connect(useShallow(pick(["account", "accounts", "disconnect"])))
  const override = useAccountOverride()
  const account =
    override === undefined
      ? activeAccount
      : (accounts.find(
          (item) =>
            item.provider === override?.provider &&
            item.address === override.address,
        ) ?? null)

  return useMemo(
    () =>
      account
        ? {
            isConnected: true,
            account: toAccount(account),
            accounts: accounts.map(toAccount),
            disconnect,
          }
        : { isConnected: false, account: null, accounts: [], disconnect },
    [account, accounts, disconnect],
  )
}
