import { createFileRoute, Navigate } from "@tanstack/react-router"

export const Route = createFileRoute("/_trade/trade/swap/")({
  component: () => <Navigate to={"/trade/swap/market"} />,
})
