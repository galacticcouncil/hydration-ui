import { Account, COMPATIBLE_WALLET_PROVIDERS } from "@/hooks/useWeb3Connect"
import { WalletAccount } from "@/types/wallet"

export const toAccount = ({
  address,
  name,
  wallet,
}: WalletAccount): Account => {
  return {
    address: address,
    displayAddress: address,
    name: name ?? "",
    provider: wallet.provider,
    isIncompatible: !COMPATIBLE_WALLET_PROVIDERS.includes(wallet.provider),
  }
}
