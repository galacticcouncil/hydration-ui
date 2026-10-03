import { stringEquals } from "@galacticcouncil/utils"

import { addressToPublicKey } from "@/utils/publicKey"

export const RECENT_EXTERNAL_WALLETS_LIMIT = 5

export const pushRecentExternalWallet = (
  recent: string[],
  address: string,
): string[] => {
  const publicKey = addressToPublicKey(address)

  return [
    address,
    ...recent.filter((a) => !stringEquals(addressToPublicKey(a), publicKey)),
  ].slice(0, RECENT_EXTERNAL_WALLETS_LIMIT)
}
