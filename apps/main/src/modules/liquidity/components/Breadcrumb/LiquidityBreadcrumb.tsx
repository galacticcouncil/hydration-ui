import { useRouterState } from "@tanstack/react-router"
import { t } from "i18next"
import { useMemo } from "react"
import { isNumber } from "remeda"

import { Breadcrumb } from "@/components/Breadcrumb"

export const liquidityActions = [
  { key: "add", label: t("liquidity:liquidity.breadcrumb.add") },
  { key: "remove", label: t("liquidity:liquidity.breadcrumb.remove") },
  { key: "join", label: t("liquidity:liquidity.breadcrumb.join") },
]

const getBreadcrumbLabel = (path: string) => {
  if (path === "/liquidity") return t("liquidity:pools")

  const lastItem = path.split("/").pop()
  if (isNumber(Number(lastItem))) return t("liquidity:omnipool")

  const action = liquidityActions.find((action) => action.key === lastItem)
  if (action) return action.label

  return "N/a"
}

export const LiquidityBreadcrumb = () => {
  const matches = useRouterState({ select: (s) => s.matches })

  const crumbs = useMemo(
    () =>
      matches
        .filter((match) => match.pathname.includes("liquidity"))
        .map((match) => {
          const path = match.pathname
          const label = getBreadcrumbLabel(path)

          return { label, path }
        }),
    [matches],
  )

  return <Breadcrumb crumbs={crumbs} />
}
