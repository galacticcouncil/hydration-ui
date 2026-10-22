import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { SubpageLayout } from "@/modules/layout/SubpageLayout"
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
  return (
    <>
      <SubpageLayout />
      <OmnipoolSubscriber />
      <IsolatedPoolsSubscriber />
    </>
  )
}

export const Route = createFileRoute("/liquidity")({
  component: Liquidity,
  staticData: { crumb: "liquidity:pools" },
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("liquidity", i18n.t),
  }),
})
