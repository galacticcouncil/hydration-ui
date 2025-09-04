import { createFileRoute, Outlet } from "@tanstack/react-router"

import {
  useIsolatedPools,
  useOmnipoolStablepools,
} from "@/modules/liquidity/Liquidity.utils"

export const Route = createFileRoute("/wallet/assets/liquidity")({
  component: function Route() {
    useOmnipoolStablepools()
    useIsolatedPools()

    return <Outlet />
  },
})
