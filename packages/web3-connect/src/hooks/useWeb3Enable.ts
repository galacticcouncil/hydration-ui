import { useMutation } from "@tanstack/react-query"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { WalletProviderType } from "@/config/providers"
import { useWeb3Connect, WalletProviderStatus } from "@/hooks/useWeb3Connect"
import { BaseWalletError } from "@/utils/errors"
import { toStoredAccount } from "@/utils/wallet"
import { getWallet } from "@/wallets"

export const useWeb3Enable = () => {
  const { setStatus, setError, disconnect, setAccounts } = useWeb3Connect(
    useShallow(pick(["setStatus", "setError", "disconnect", "setAccounts"])),
  )

  const { mutateAsync: enable, ...mutation } = useMutation({
    mutationFn: async (type: WalletProviderType) => {
      const wallet = getWallet(type)
      if (!wallet) return []
      await wallet.enable()
      return wallet.getAccounts()
    },
    retry: false,
    onMutate: (type) => setStatus(type, WalletProviderStatus.Pending),
    onSuccess: (data, type) => {
      setAccounts(data.map(toStoredAccount))
      setStatus(type, WalletProviderStatus.Connected)
    },
    onError: (error, type) => {
      setStatus(type, WalletProviderStatus.Error)
      if (error instanceof BaseWalletError) {
        setError(error.message)
      } else {
        console.error(error)
        setError("Unexpected error, please try again.")
      }
    },
  })

  return {
    enable,
    disconnect,
    ...mutation,
  }
}
