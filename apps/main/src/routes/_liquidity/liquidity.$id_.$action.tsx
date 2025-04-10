import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_liquidity/liquidity/$id_/$action")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Action</div>
}
