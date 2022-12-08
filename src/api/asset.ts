import { useAssetMeta } from "./assetMeta"
import { useAssetDetails } from "./assetDetails"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { u32 } from "@polkadot/types"
import { Maybe } from "utils/helpers"
import { useTradeRouter } from "utils/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import type { TradeRouter } from "@galacticcouncil/sdk"

export const useAsset = (id: Maybe<u32 | string>) => {
  const detail = useAssetDetails(id)
  const meta = useAssetMeta(id)

  const queries = [detail, meta]
  const isLoading = queries.some((q) => q.isLoading)

  const icon = getAssetLogo(meta.data?.symbol)

  if (detail.data == null || meta.data == null)
    return { isLoading, data: undefined }

  return {
    isLoading,
    data: {
      ...detail.data,
      decimals: meta.data.decimals,
      symbol: meta.data.symbol,
      icon,
    },
  }
}

export const useTradeAssets = () => {
  const tradeRouter = useTradeRouter()
  return useQuery(QUERY_KEYS.tradeAssets, getTradeAssets(tradeRouter))
}

const getTradeAssets = (tradeRouter: TradeRouter) => async () => {
  return tradeRouter.getAllAssets()
}
