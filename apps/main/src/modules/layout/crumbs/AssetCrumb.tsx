import { useParams } from "@tanstack/react-router"

import { AssetCrumbProps } from "@/modules/layout/crumbs/types"
import { useAssets } from "@/providers/assetsProvider"

export const AssetCrumb = ({
  assetId,
  param,
  field = "name",
}: AssetCrumbProps) => {
  const assets = useAssets()
  const routeParams = useParams({ strict: false, shouldThrow: false })
  const id =
    assetId ?? String(routeParams?.[param as keyof typeof routeParams] ?? "")

  if (typeof assets.getAsset !== "function") return null

  const asset = assets.getAsset(id)

  if (asset) return asset[field]

  return null
}
