import { useAssetMeta } from "./assetMeta"
import { useAssetDetails } from "./assetDetails"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { u32 } from "@polkadot/types"

export const useAsset = (id: u32) => {
  const detail = useAssetDetails(id)
  const meta = useAssetMeta(id)

  const queries = [detail, meta]
  const isLoading = queries.some((q) => q.isLoading)

  const icon = getAssetLogo(detail.data?.name)

  return {
    isLoading,
    data: {
      ...detail.data,
      ...meta.data?.data,
      icon,
    },
  }
}
