import type { AssetAmount } from "@galacticcouncil/xc-core"
import Big from "big.js"

import { toDecimal } from "@/utils/formatting"

import type { DepositQuickAssetGroup } from "./DepositQuickAssetGroups"
export type QuickDepositBalance = { amount: AssetAmount; depositable: boolean }
export type QuickDepositBalances = Map<string, QuickDepositBalance>
export const quickBalanceKey = (chain: string, asset: string) =>
  JSON.stringify([chain, asset])

export const getQuickGroupBalance = (
  group: DepositQuickAssetGroup,
  balances: QuickDepositBalances,
): string | undefined => {
  let total = Big(0)
  let found = false
  for (const { chain, asset } of group.sources) {
    const balance = balances.get(quickBalanceKey(chain.key, asset.key))?.amount
    if (!balance) continue
    total = total.plus(toDecimal(balance.amount, balance.decimals))
    found = true
  }
  return found ? total.toString() : undefined
}

export const splitQuickAssetGroups = (
  groups: DepositQuickAssetGroup[],
  balances: QuickDepositBalances,
) => {
  const funded: DepositQuickAssetGroup[] = []
  const other = groups
  for (const group of groups) {
    const sources = group.sources.filter(({ chain, asset }) => {
      const balance = balances.get(quickBalanceKey(chain.key, asset.key))
      return !!balance && balance.depositable && balance.amount.amount > 0n
    })
    if (sources.length) funded.push({ ...group, ...sources[0]!, sources })
  }
  return { funded, other }
}
