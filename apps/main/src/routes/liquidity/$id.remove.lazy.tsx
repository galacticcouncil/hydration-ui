import { createLazyFileRoute } from "@tanstack/react-router"

export const Route = createLazyFileRoute("/liquidity/$id/remove")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Remove</div>
}
