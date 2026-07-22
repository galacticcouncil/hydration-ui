import { HYDRATION_CHAIN_KEY, stringEquals } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import Big from "big.js"

import { XcBalance, XcOcnUrn } from "@/modules/balances/api/xcBalanceTypes"
import { resolveChainFromUrn } from "@/modules/xcm/history/utils/claim"
import { NATIVE_ASSET_ID } from "@/utils/consts"

export type XcRawAssetId =
  | string
  | number
  | {
      parents: unknown
      interior: unknown
    }

export const normalizeXcAssetId = (assetId: unknown): string => {
  if (typeof assetId === "string") return assetId
  if (typeof assetId === "number") return String(assetId)

  if (
    assetId !== null &&
    typeof assetId === "object" &&
    "parents" in assetId &&
    "interior" in assetId
  ) {
    return JSON.stringify(assetId)
  }

  return String(assetId ?? "")
}

export const filterNonZeroBalances = (
  balances: ReadonlyArray<XcBalance>,
): XcBalance[] => balances.filter((balance) => Big(balance.balance).gt(0))

export const filterHydrationTableBalances = (
  balances: ReadonlyArray<XcBalance>,
): XcBalance[] =>
  balances.filter((balance) => balance.assetId !== NATIVE_ASSET_ID)

export const resolveHydrationRegistryAssetId = (assetId: string): string =>
  assetId === "native" ? NATIVE_ASSET_ID : assetId

export const resolveXcBalancePriceAssetId = (
  chainId: XcOcnUrn,
  assetId: string,
): string | undefined => {
  const chain = resolveChainFromUrn(chainId)
  const registryChain = chainsMap.get(HYDRATION_CHAIN_KEY)
  if (!chain || !registryChain) return undefined

  const registryAssetId =
    chain.key === HYDRATION_CHAIN_KEY
      ? resolveHydrationRegistryAssetId(assetId)
      : assetId

  const entry = Array.from(chain.assetsData.values()).find(
    (data) =>
      data.id !== null && stringEquals(String(data.id), registryAssetId),
  )
  if (!entry) {
    if (chain.key === HYDRATION_CHAIN_KEY) return registryAssetId
    return undefined
  }

  return registryChain.getBalanceAssetId(entry.asset).toString()
}
