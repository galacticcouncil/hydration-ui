import { useMatches } from "@tanstack/react-router"
import { ParseKeys, TFunction } from "i18next"
import { createElement, ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { capitalize, isObjectType } from "remeda"

import {
  getMenuTranslations,
  NAVIGATION,
  NavigationItem,
} from "@/config/navigation"
import { AssetCrumb } from "@/modules/layout/crumbs/AssetCrumb"
import { PoolCrumb } from "@/modules/layout/crumbs/PoolCrumb"
import {
  AssetCrumbConfig,
  PoolCrumbConfig,
} from "@/modules/layout/crumbs/types"

export type Crumb = { label: ReactNode; path: string }

type CrumbConfig = AssetCrumbConfig | PoolCrumbConfig

export const useCrumbs = (): Crumb[] => {
  const { t } = useTranslation()

  return useMatches().flatMap<Crumb>(
    ({ staticData, pathname, fullPath, params }) => {
      const { crumb } = staticData

      if (pathname === "/" || crumb === undefined) return []

      if (crumb === true) {
        return {
          label: navLabel(fullPath, t) ?? fallbackLabel(pathname),
          path: pathname,
        }
      }

      if (typeof crumb === "string") {
        return { label: t(crumb as ParseKeys), path: pathname }
      }

      if (isCrumbConfig(crumb, "asset")) {
        const routeParams = params as Record<string, string | undefined>

        return {
          label: createElement(AssetCrumb, {
            assetId: routeParams[crumb.param],
            param: crumb.param,
            from: crumb.from,
            field: crumb.field,
          }),
          path: pathname,
        }
      }

      if (isCrumbConfig(crumb, "pool")) {
        const routeParams = params as Record<string, string | undefined>

        return {
          label: createElement(PoolCrumb, {
            assetId: routeParams[crumb.param],
            param: crumb.param,
            from: crumb.from,
          }),
          path: pathname,
        }
      }

      return { label: createElement(crumb), path: pathname }
    },
  )
}

function isCrumbConfig<T extends CrumbConfig["type"]>(
  crumb: unknown,
  type: T,
): crumb is Extract<CrumbConfig, { type: T }> {
  return isObjectType(crumb) && "type" in crumb && crumb.type === type
}

function flattenNav(items: NavigationItem[]): NavigationItem[] {
  return items.flatMap((item) => [item, ...flattenNav(item.children ?? [])])
}

function navLabel(fullPath: string, t: TFunction) {
  const item = flattenNav(NAVIGATION).find(
    ({ to }) => to?.replace(/\/$/, "") === fullPath.replace(/\/$/, ""),
  )

  return item && getMenuTranslations(t)[item.key].title
}

function fallbackLabel(pathname: string) {
  return capitalize(pathname.split("/").filter(Boolean).at(-1) ?? "")
}
