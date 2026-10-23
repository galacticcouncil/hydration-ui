import {
  toAccount,
  useWeb3Connect,
  WalletProviderStatus,
} from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { useMemo } from "react"

export const useDepositAccounts = ({ signersOnly = false } = {}) => {
  const accounts = useWeb3Connect((state) => state.accounts)
  const providers = useWeb3Connect((state) => state.providers)
  return useMemo(
    () =>
      accounts
        .filter(
          (account) =>
            (!signersOnly ||
              (account.provider !== WalletProviderType.ExternalWallet &&
                account.provider !== WalletProviderType.Multisig &&
                !account.isMultisig &&
                !!getWallet(account.provider)?.enabled)) &&
            providers.some(
              (provider) =>
                provider.type === account.provider &&
                provider.status === WalletProviderStatus.Connected,
            ),
        )
        .map(toAccount),
    [accounts, providers, signersOnly],
  )
}
