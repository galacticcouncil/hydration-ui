import { createFileRoute, Navigate } from "@tanstack/react-router"

export const Route = createFileRoute("/trade/_history/swap/")({
  component: () => <Navigate to={"/trade/swap/market"} />,
})
