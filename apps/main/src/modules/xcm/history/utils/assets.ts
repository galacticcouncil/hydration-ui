import { AaveV3HydrationMainnet } from "@galacticcouncil/money-market/ui-config"
import { HOLLAR_ASSET_ID, isH160Address } from "@galacticcouncil/utils"
import { ChainEcosystem } from "@galacticcouncil/xc-core"
import { XcAssetOperation, XcJourney } from "@galacticcouncil/xc-scan"
import { isNumber, isString, sortBy } from "remeda"

const networkToEcosystem: Record<string, ChainEcosystem> = {
  polkadot: ChainEcosystem.Polkadot,
  kusama: ChainEcosystem.Kusama,
  ethereum: ChainEcosystem.Ethereum,
  solana: ChainEcosystem.Solana,
  sui: ChainEcosystem.Sui,
}

const H160_ASSET_IDS: Record<string, string> = {
  [AaveV3HydrationMainnet.GHO_TOKEN_ADDRESS.toLowerCase()]: HOLLAR_ASSET_ID,
}

function resolveH160ToAssetId(assetId: string): string {
  if (!isH160Address(assetId)) return assetId
  return H160_ASSET_IDS[assetId.toLowerCase()] ?? assetId
}

export function resolveNetwork(networkUrn: string) {
  const parts = networkUrn.indexOf(":") > 0 ? networkUrn.split(":") : []
  const [, , network, chainId] = parts
  const ecosystem = networkToEcosystem[network ?? ""]
  if (!ecosystem || !chainId) return
  return {
    ecosystem,
    chainId,
  }
}

function getNativeAssetPath(networkUrn: string) {
  switch (networkUrn) {
    case "urn:ocn:polkadot:2004":
      return "0x0000000000000000000000000000000000000802"
    case "urn:ocn:ethereum:1":
      return "0x0000000000000000000000000000000000000000"
    case "urn:ocn:ethereum:8453":
      return "0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42"
    case "urn:ocn:sui:0x35834a8a":
      return "SUI"
    default:
      return "0"
  }
}

export function resolveAssetIcon(key: string) {
  if (key.indexOf("|") < 0) {
    return
  }

  const [networkUrn, assetUrn] = key.split("|")

  if (!networkUrn || !assetUrn) {
    return
  }

  const network = resolveNetwork(networkUrn)
  if (!network) {
    return
  }

  const assetKey = assetUrn === "" ? "native" : assetUrn.split(":").join("/")
  let assetId =
    assetKey === "native" ? getNativeAssetPath(networkUrn) : assetKey

  if (isH160Address(assetId)) {
    assetId = resolveH160ToAssetId(assetId)
  }

  return {
    ...network,
    networkUrn,
    assetId,
  }
}

export type XcJourneyTransferAsset = Omit<
  XcAssetOperation,
  "symbol" | "decimals"
> & {
  symbol: string
  decimals: number
}

export function getTransferUsdValue(
  journey: XcJourney,
  transferAsset?: Pick<XcAssetOperation, "usd">,
): number {
  const asset = transferAsset ?? getTransferAsset(journey)
  return asset?.usd ?? journey.totalUsd ?? 0
}

export function getTransferAsset(
  journey: XcJourney,
): XcJourneyTransferAsset | undefined {
  const assets = sortBy(journey.assets, [
    (asset) => asset.sequence ?? 0,
    "desc",
  ])
  const transferAsset = assets.find((a) => {
    const [destinationUrn] = a.asset.split("|")
    return a.role === "transfer" && journey.destination === destinationUrn
  })

  const asset = transferAsset || assets[0]

  if (
    isString(asset?.symbol) &&
    isNumber(asset?.decimals) &&
    isFinite(asset.decimals)
  ) {
    return {
      ...asset,
      symbol: asset.symbol,
      decimals: asset.decimals,
    }
  }
}
