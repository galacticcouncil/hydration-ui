import { ComponentType } from "react"

import {
  AssetCrumbConfig,
  PoolCrumbConfig,
} from "@/modules/layout/crumbs/types"

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    crumb?: true | string | ComponentType | AssetCrumbConfig | PoolCrumbConfig
    showSubNav?: boolean
  }
}
