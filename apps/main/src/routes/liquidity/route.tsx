import { createFileRoute } from "@tanstack/react-router"

import { useIsActiveQueries } from "@/hooks/useIsActiveQueries"
import { SubpageLayout } from "@/modules/layout/SubpageLayout"
import { LiquiditySubpageMenu } from "@/modules/liquidity/components/LiquiditySubpageMenu"
import {
  useIsolatedPools,
  useOmnipoolStablepools,
} from "@/modules/liquidity/Liquidity.utils"

const OmnipoolSubscriber = () => {
  useOmnipoolStablepools()

  return null
}

const IsolatedPoolsSubscriber = () => {
  useIsolatedPools()

  return null
}

const Liquidity = () => {
  const isActiveOmnipool = useIsActiveQueries(["omnipoolAssets"])
  const isActiveXYK = useIsActiveQueries(["xykLiquidityPools"])
  return (
    <>
      <SubpageLayout subpageMenu={<LiquiditySubpageMenu />} />
      {isActiveOmnipool && <OmnipoolSubscriber />}
      {isActiveXYK && <IsolatedPoolsSubscriber />}
    </>
  )
}

export const Route = createFileRoute("/liquidity")({
  component: Liquidity,
})
