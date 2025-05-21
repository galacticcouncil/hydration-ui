import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/trade/_history/swap/dca")({
  component: RouteComponent,
})

function RouteComponent() {
  return "N / A"
}
