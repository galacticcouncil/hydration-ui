import { useAssetMeta } from "./assetMeta"
import { useAssetDetails } from "./assetDetails"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { u32 } from "@polkadot/types"
import { Maybe, useQueryReduce } from "utils/helpers"
import { useTradeRouter } from "utils/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import type { TradeRouter } from "@galacticcouncil/sdk"

export const useAsset = (id: Maybe<u32 | string>) => {
  const detail = useAssetDetails(id)
  const meta = useAssetMeta(id)

  return useQueryReduce([detail, meta] as const, (detail, meta) => {
    if (detail == null || meta == null) return undefined
    return {
      ...detail,
      decimals: meta.decimals,
      symbol: meta.symbol,
      icon: getAssetLogo(meta.symbol),
    }
  })
}

export const useTradeAssets = () => {
  const tradeRouter = useTradeRouter()
  return useQuery(QUERY_KEYS.tradeAssets, getTradeAssets(tradeRouter))
}

const getTradeAssets = (tradeRouter: TradeRouter) => async () => {
  return tradeRouter.getAllAssets()
}
