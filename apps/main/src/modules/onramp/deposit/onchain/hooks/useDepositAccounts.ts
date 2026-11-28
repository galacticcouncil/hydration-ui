import {
  toAccount,
  useWeb3Connect,
  WalletProviderStatus,
} from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { useMemo } from "react"

/** Connected accounts that can sign a deposit: no watch-only or multisig. */
export const useDepositAccounts = () => {
  const accounts = useWeb3Connect((state) => state.accounts)
  const providers = useWeb3Connect((state) => state.providers)
  return useMemo(
    () =>
      accounts
        .filter(
          (account) =>
            account.provider !== WalletProviderType.ExternalWallet &&
            account.provider !== WalletProviderType.Multisig &&
            !account.isMultisig &&
            !!getWallet(account.provider)?.enabled &&
            providers.some(
              (provider) =>
                provider.type === account.provider &&
                provider.status === WalletProviderStatus.Connected,
            ),
        )
        .map(toAccount),
    [accounts, providers],
  )
}
