import { useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { AssetType } from "@/api/assets"
import { PoolCrumbProps } from "@/modules/layout/crumbs/types"
import { useAssets } from "@/providers/assetsProvider"
import { useOmnipoolAsset, useXYKPool } from "@/states/liquidity"

export const PoolCrumb = ({ assetId, param }: PoolCrumbProps) => {
  const { t } = useTranslation(["common", "liquidity"])
  const assets = useAssets()
  const routeParams = useParams({ strict: false, shouldThrow: false })
  const id =
    assetId ?? String(routeParams?.[param as keyof typeof routeParams] ?? "")

  const { data: omnipoolData, isLoading: isOmnipoolLoading } =
    useOmnipoolAsset(id)
  const { data: xykData, isLoading: isXYKLoading } = useXYKPool(id)

  if (
    !id ||
    typeof assets.getAsset !== "function" ||
    isOmnipoolLoading ||
    isXYKLoading
  ) {
    return null
  }

  const asset = assets.getAsset(id)

  if (asset?.type === AssetType.STABLESWAP) return t("stablepool")
  if (omnipoolData) return t("liquidity:omnipool")
  if (xykData) return t("liquidity:isolatedPool")

  return null
}
