import { useMatches } from "@tanstack/react-router"
import { t } from "i18next"
import { FC } from "react"
import { isNumber } from "remeda"

import { Breadcrumb } from "@/components/Breadcrumb"
import { FileRouteTypes } from "@/routeTree.gen"

export const liquidityActions = [
  { key: "add", label: t("liquidity:addLiquidity") },
  { key: "addStablepool", label: t("liquidity:addLiquidity") },
  { key: "remove", label: t("liquidity:removeLiquidity") },
  { key: "join", label: t("liquidity:joinFarms") },
]

const getBreadcrumbLabel = (path: FileRouteTypes["fullPaths"]): string => {
  switch (path) {
    case "/liquidity":
      return t("liquidity:pools")
    case "/liquidity/$id/remove":
      return t("liquidity:removeLiquidity")
    case "/liquidity/$id/join":
      return t("liquidity:joinFarms")
    case "/liquidity/create":
      return t("liquidity:createPool")

    default: {
      const lastItem = path.split("/").pop()
      const isLastItemId = isNumber(Number(lastItem))

      if (isLastItemId) return t("liquidity:omnipool")

      const action = liquidityActions.find((action) => action.key === lastItem)
      if (action) return action.label

      return t("liquidity:isolatedPool")
    }
  }
}

export const LiquidityBreadcrumb: FC = () => {
  const paths = useMatches({
    select: (matches) => matches.map((match) => match.fullPath),
  })

  const crumbs = paths
    .filter((path) => path.includes("liquidity"))
    .map((path) => ({
      label: getBreadcrumbLabel(path),
      path,
    }))

  return <Breadcrumb crumbs={crumbs} />
}
