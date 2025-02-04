import { createLazyFileRoute, useLocation } from "@tanstack/react-router"

import { Market } from "@/modules/trade/sections/Market"

export const Route = createLazyFileRoute("/_trade/trade/swap/$section")({
  component: RouteComponent,
})

function RouteComponent() {
  const pathname = useLocation({
    select: (state) => state.pathname,
  })

  if (pathname.includes("market")) return <Market />

  return null
}
