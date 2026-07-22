import { XcRawAssetId } from "@/modules/balances/api/xcBalanceUtils"

export type XcOcnUrn = `urn:ocn:${string}`

export const HYDRATION_OCN_URN = "urn:ocn:polkadot:2034" as const

export type XcBalanceOrigin = "snapshot" | "update"

export type XcBalanceStatusEvent = {
  status: string
  accountId: string
  publicKey: string
}

export type XcBalanceEvent = {
  origin: XcBalanceOrigin
  accountId: string
  publicKey: string
  balance: string
  chainId: XcOcnUrn
  assetId: XcRawAssetId
  symbol: string
  decimals: number
}

export type XcBalanceSyncedEvent = {
  accountId: string
  publicKey: string
}

export type XcBalance = {
  accountId: string
  publicKey: string
  balance: string
  chainId: XcOcnUrn
  assetId: string
  symbol: string
  decimals: number
}

export const xcBalanceKey = (
  balance: Pick<XcBalance, "chainId" | "assetId">,
): string => `${balance.chainId}:${balance.assetId}`
