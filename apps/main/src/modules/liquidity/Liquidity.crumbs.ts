import { useMatches } from "@tanstack/react-router"
import { t } from "i18next"
import { useTranslation } from "react-i18next"

import { AssetType } from "@/api/assets"
import { BreadcrumbItem } from "@/components/Breadcrumb"
import { useAssets } from "@/providers/assetsProvider"
import { FileRouteTypes } from "@/routeTree.gen"

export const useLiquidityCrumbs = (): BreadcrumbItem[] => {
  const { t } = useTranslation(["common", "liquidity"])
  const { getAsset } = useAssets()

  const paths = useMatches({
    select: (matches) =>
      matches.map((match) => ({
        fullPath: match.fullPath,
        params: match.params,
      })),
  })

  const crumbs = paths
    .filter(({ fullPath }) => fullPath.includes("liquidity"))
    .map(({ fullPath, params }) => {
      if (fullPath === "/liquidity/$id") {
        let label = "N/A"

        if (params && "id" in params) {
          const { id } = params
          const asset = getAsset(id)

          if (asset) {
            label =
              asset.type === AssetType.STABLESWAP
                ? t("stablepool")
                : t("liquidity:omnipool")
          } else {
            label = t("liquidity:isolatedPool")
          }
        }
        return {
          label,
          path: fullPath,
        }
      } else {
        return {
          label: getBreadcrumbLabel(fullPath),
          path: fullPath,
        }
      }
    })

  return crumbs
}

const getBreadcrumbLabel = (path: FileRouteTypes["fullPaths"]): string => {
  switch (path) {
    case "/liquidity":
      return t("liquidity:pools")
    case "/liquidity/$id/add":
      return t("liquidity:addLiquidity")
    case "/liquidity/$id/remove":
      return t("liquidity:removeLiquidity")
    case "/liquidity/$id/join":
      return t("liquidity:joinFarms")
    case "/liquidity/create":
      return t("liquidity:createPool")
    default:
      return "N/A"
  }
}
