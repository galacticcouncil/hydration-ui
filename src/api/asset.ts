import { useAssetMeta } from "./assetMeta"
import { useAssetDetails } from "./assetDetails"

export function useAsset(id: string) {
  const detail = useAssetDetails(id)
  const meta = useAssetMeta(id)

  const queries = [detail, meta]
  const isLoading = queries.some((q) => q.isLoading)

  return {
    isLoading,
    data: {
      ...detail.data,
      ...meta.data,
    },
  }
}
