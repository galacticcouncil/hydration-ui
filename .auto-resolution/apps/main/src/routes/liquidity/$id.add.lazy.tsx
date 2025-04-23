import { createLazyFileRoute } from "@tanstack/react-router"

export const Route = createLazyFileRoute("/liquidity/$id/add")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Add</div>
}
