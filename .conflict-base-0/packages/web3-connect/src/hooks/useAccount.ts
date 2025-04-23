import { pick } from "remeda"
import { useShallow } from "zustand/react/shallow"

import { Account, useWeb3Connect } from "@/hooks/useWeb3Connect"

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
  const { account, accounts, disconnect } = useWeb3Connect(
    useShallow(pick(["account", "accounts", "disconnect"])),
  )

  return account
    ? {
        isConnected: true,
        account,
        accounts,
        disconnect,
      }
    : { isConnected: false, account: null, accounts: [], disconnect }
}
