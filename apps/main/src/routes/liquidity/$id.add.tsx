import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/liquidity/$id/add")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Add</div>
}
