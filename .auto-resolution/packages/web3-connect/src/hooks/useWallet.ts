import { useMemo } from "react"

import { useAccount } from "@/hooks/useAccount"
import { getWallet } from "@/wallets"

export const useWallet = () => {
  const { account } = useAccount()
  return useMemo(
    () => (account ? getWallet(account.provider) : null),
    [account],
  )
}
