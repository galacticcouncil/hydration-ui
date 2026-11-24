import { ComponentType } from "react"

import {
  AssetCrumbConfig,
  PoolCrumbConfig,
} from "@/modules/layout/crumbs/types"

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    crumb?: true | string | ComponentType | AssetCrumbConfig | PoolCrumbConfig
    showSubNav?: boolean
    /** Which bar the loading layout shows; both when unset. The deepest match wins. */
    pendingNavBar?: "subnav" | "breadcrumb"
  }
}
