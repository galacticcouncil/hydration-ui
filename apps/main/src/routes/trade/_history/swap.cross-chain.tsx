import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/trade/_history/swap/cross-chain")({
  component: RouteComponent,
})

function RouteComponent() {
  return "N / A"
}
