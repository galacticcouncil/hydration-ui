import { createLazyFileRoute, Navigate } from "@tanstack/react-router"

export const Route = createLazyFileRoute("/_trade/trade/swap/")({
  component: () => <Navigate to={"/trade/swap/market"} />,
})
