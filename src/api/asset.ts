import { useAssetMeta } from "./assetMeta"
import { useAssetDetails } from "./assetDetails"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { u32 } from "@polkadot/types"
import { TradeRouter } from "@galacticcouncil/sdk"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { AUSD_NAME } from "utils/constants"
import { useMemo } from "react"
import { useTradeRouter } from "utils/api"
import { Maybe } from "utils/helpers"

export const useAsset = (id: Maybe<u32 | string>) => {
  const detail = useAssetDetails(id)
  const meta = useAssetMeta(id)

  const queries = [detail, meta]
  const isLoading = queries.some((q) => q.isLoading)

  const icon = getAssetLogo(detail.data?.name)

  if (detail.data == null || meta.data?.data == null)
    return { isLoading, data: undefined }

  return {
    isLoading,
    data: {
      ...detail.data,
      ...meta.data.data,
      icon,
    },
  }
}

export const useAssets = () => {
  const tradeRouter = useTradeRouter()
  return useQuery(QUERY_KEYS.assets, getAllAssets(tradeRouter))
}

export const getAllAssets = (tradeRouter: TradeRouter) => async () =>
  tradeRouter.getAllAssets()

export const useAUSD = () => {
  const { data, isLoading } = useAssets()

  const aUSD = useMemo(
    () =>
      data?.find(
        (asset) => asset.symbol.toLowerCase() === AUSD_NAME.toLowerCase(),
      ),
    [data],
  )

  return { data: aUSD, isLoading }
}
