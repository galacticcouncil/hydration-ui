import { createFileRoute, useMatch } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { SubpageLayout } from "@/modules/layout/SubpageLayout"
import { LiquidityBreadcrumb } from "@/modules/liquidity/components/Breadcrumb/LiquidityBreadcrumb"
import {
  useIsolatedPools,
  useOmnipoolStablepools,
} from "@/modules/liquidity/Liquidity.utils"

export const OmnipoolSubscriber = () => {
  useOmnipoolStablepools()

  return null
}

const IsolatedPoolsSubscriber = () => {
  useIsolatedPools()

  return null
}

const Liquidity = () => {
  const isPoolsPage = useMatch({
    from: "/liquidity/",
    shouldThrow: false,
  })

  return (
    <>
      <SubpageLayout subpageMenu={!isPoolsPage && <LiquidityBreadcrumb />} />
      <OmnipoolSubscriber />
      <IsolatedPoolsSubscriber />
    </>
  )
}

export const Route = createFileRoute("/liquidity")({
  component: Liquidity,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("liquidity", i18n.t),
  }),
})
