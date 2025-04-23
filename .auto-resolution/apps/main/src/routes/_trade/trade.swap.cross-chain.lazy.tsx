import { createLazyFileRoute } from "@tanstack/react-router"

export const Route = createLazyFileRoute("/_trade/trade/swap/cross-chain")({
  component: RouteComponent,
})

function RouteComponent() {
  return "N / A"
}
