import { HOLLAR_ASSET_ID, HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"

import type { SwapTabParam } from "@/config/navigation"
import { NATIVE_ASSET_ID } from "@/utils/consts"
import { isHydrationAssetId, XcPlatform } from "@/utils/trade"

export const DEFAULT_TRADE_ASSET_IN_ID = HOLLAR_ASSET_ID
export const DEFAULT_TRADE_ASSET_OUT_ID = NATIVE_ASSET_ID

type SwapSearch = {
  assetIn: string
  assetOut: string
  destPlatform: XcPlatform
}

const SWAP_TAB_DEST_PLATFORMS: Record<
  SwapTabParam,
  ReadonlyArray<XcPlatform>
> = {
  market: ["hydration", "near", "zec", "btc"],
  limit: ["hydration"],
  twap: ["hydration", "near", "zec", "btc"],
}

const isSwapTabParam = (tab: string): tab is SwapTabParam =>
  Object.hasOwn(SWAP_TAB_DEST_PLATFORMS, tab)

export const isCrossChainSwapSearch = ({
  assetIn,
  assetOut,
  destPlatform,
}: SwapSearch) =>
  destPlatform !== HYDRATION_CHAIN_KEY ||
  !isHydrationAssetId(assetIn) ||
  !isHydrationAssetId(assetOut)

export const normalizeSearchForOnChainSwapTab = <T extends SwapSearch>(
  search: T,
): T => {
  if (!isCrossChainSwapSearch(search)) {
    return search
  }

  let assetIn = isHydrationAssetId(search.assetIn)
    ? search.assetIn
    : DEFAULT_TRADE_ASSET_IN_ID
  let assetOut = isHydrationAssetId(search.assetOut)
    ? search.assetOut
    : DEFAULT_TRADE_ASSET_OUT_ID

  if (assetIn === assetOut) {
    if (assetIn === DEFAULT_TRADE_ASSET_IN_ID) {
      assetOut = DEFAULT_TRADE_ASSET_OUT_ID
    } else {
      assetIn = DEFAULT_TRADE_ASSET_IN_ID
    }
  }

  return {
    ...search,
    assetIn,
    assetOut,
    destPlatform: HYDRATION_CHAIN_KEY,
  }
}

export const normalizeSearchForSwapTab = <T extends SwapSearch>(
  tab: string | undefined,
  search: T,
): T => {
  if (!tab || !isSwapTabParam(tab)) {
    return search
  }

  if (!SWAP_TAB_DEST_PLATFORMS[tab].includes(search.destPlatform)) {
    return normalizeSearchForOnChainSwapTab(search)
  }

  if (tab === "market") {
    return search
  }

  if (search.destPlatform === HYDRATION_CHAIN_KEY) {
    return normalizeSearchForOnChainSwapTab(search)
  }

  // A Intent TWAP sells a Hydration asset
  return isHydrationAssetId(search.assetIn)
    ? search
    : { ...search, assetIn: DEFAULT_TRADE_ASSET_IN_ID }
}
