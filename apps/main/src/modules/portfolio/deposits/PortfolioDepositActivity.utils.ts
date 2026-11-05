import { accountPublicKey } from "@galacticcouncil/utils"

export const isDepositAccountAddress = (
  depositAddress: string,
  accountAddress?: string,
): boolean => {
  const accountKey = accountPublicKey(accountAddress ?? "")
  return !!accountKey && accountKey === accountPublicKey(depositAddress)
}
