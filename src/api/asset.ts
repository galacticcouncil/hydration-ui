import { useAssetMeta } from "./assetMeta"
import { useAssetDetails, useAssetDetailsList } from "./assetDetails"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { u32 } from "@polkadot/types"
import { Maybe, useQuerySelect } from "utils/helpers"
import { TradeRouter } from "@galacticcouncil/sdk"
import { useTradeRouter } from "utils/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"

export const useAsset = (id: Maybe<u32 | string>) => {
  const detail = useAssetDetails(id)
  const meta = useAssetMeta(id)

  const queries = [detail, meta]
  const isLoading = queries.some((q) => q.isLoading)

  const icon = getAssetLogo(detail.data?.name)

  if (detail.data == null || meta.data == null)
    return { isLoading, data: undefined }

  return {
    isLoading,
    data: {
      ...detail.data,
      decimals: meta.data.decimals,
      icon,
    },
  }
}

export const useUsdPeggedAsset = () => {
  return useQuerySelect(useAssetDetailsList(), (data) =>
    data.find(
      (asset) =>
        asset.name.toLowerCase() ===
        import.meta.env.VITE_USD_PEGGED_ASSET_NAME.toLowerCase(),
    ),
  )
}

export const useTradeAssets = () => {
  const tradeRouter = useTradeRouter()
  return useQuery(QUERY_KEYS.tradeAssets, getTradeAssets(tradeRouter))
}

const getTradeAssets = (tradeRouter: TradeRouter) => async () => {
  return tradeRouter.getAllAssets()
}
