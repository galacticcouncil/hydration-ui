import { useRouterState } from "@tanstack/react-router"
import { t } from "i18next"
import { isNumber } from "remeda"

import { Breadcrumb } from "@/components/Breadcrumb"

export const liquidityActions = [
  { key: "add", label: t("liquidity:addLiquidity") },
  { key: "addStablepool", label: t("liquidity:addLiquidity") },
  { key: "remove", label: t("liquidity:removeLiquidity") },
  { key: "join", label: t("liquidity:joinFarms") },
]

const getBreadcrumbLabel = (path: string): string => {
  if (path === "/liquidity") return t("liquidity:pools")

  if (path.includes("remove")) return t("liquidity:removeLiquidity")

  if (path.includes("join")) return t("liquidity:joinFarms")

  if (path.includes("create")) return t("liquidity:createPool")

  const lastItem = path.split("/").pop()
  const isLastItemId = isNumber(Number(lastItem))

  if (isLastItemId) return t("liquidity:omnipool")

  const action = liquidityActions.find((action) => action.key === lastItem)
  if (action) return action.label

  return t("liquidity:isolatedPool")
}

export const LiquidityBreadcrumb = () => {
  const matches = useRouterState({ select: (s) => s.matches })

  const crumbs = matches
    .filter((match) => match.pathname.includes("liquidity"))
    .map((match) => {
      const path = match.pathname
      const label = getBreadcrumbLabel(path)

      return { label, path }
    })

  return <Breadcrumb crumbs={crumbs} />
}
