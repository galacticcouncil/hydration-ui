import { isH160Address, safeConvertH160toSS58 } from "@galacticcouncil/utils"

import { Account, COMPATIBLE_WALLET_PROVIDERS } from "@/hooks/useWeb3Connect"
import { WalletAccount } from "@/types/wallet"

export const toAccount = ({
  address,
  name,
  provider,
}: WalletAccount): Account => {
  return {
    address: isH160Address(address) ? safeConvertH160toSS58(address) : address,
    displayAddress: address,
    name: name ?? "",
    provider: provider,
    isIncompatible: !COMPATIBLE_WALLET_PROVIDERS.includes(provider),
  }
}
