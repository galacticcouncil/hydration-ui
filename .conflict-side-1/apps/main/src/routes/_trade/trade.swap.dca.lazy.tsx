import { createLazyFileRoute } from "@tanstack/react-router"

export const Route = createLazyFileRoute("/_trade/trade/swap/dca")({
  component: RouteComponent,
})

function RouteComponent() {
  return "N / A"
}
