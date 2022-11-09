import { useAssetMeta } from "./assetMeta"
import { useAssetDetails, useAssetDetailsList } from "./assetDetails"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { u32 } from "@polkadot/types"
import { AUSD_NAME } from "utils/constants"
import { useMemo } from "react"
import { Maybe } from "utils/helpers"

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

export const useAUSD = () => {
  const { data, ...rest } = useAssetDetailsList()

  const aUSD = useMemo(
    () =>
      data?.find(
        (asset) => asset.name.toLowerCase() === AUSD_NAME.toLowerCase(),
      ),
    [data],
  )

  return { data: aUSD, ...rest }
}
