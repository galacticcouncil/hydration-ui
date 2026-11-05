import { isAddressValidOnHydration } from "@galacticcouncil/utils"
import type { Account } from "@galacticcouncil/web3-connect"

export const canUseWithdrawAccount = (
  account: Account | null,
): account is Account =>
  !!account &&
  account.canUseOnHydration &&
  isAddressValidOnHydration(account.rawAddress)

export const selectWithdrawSourceAccount = (
  active: Account | null,
  connected: Account[],
): Account | null => {
  const compatible = connected.filter(canUseWithdrawAccount)
  return (
    compatible.find(
      (account) =>
        !!active &&
        account.address === active.address &&
        account.provider === active.provider,
    ) ??
    compatible[0] ??
    null
  )
}
