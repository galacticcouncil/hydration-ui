import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/liquidity/$id/remove")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Remove</div>
}
