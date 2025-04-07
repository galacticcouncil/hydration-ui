import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_liquidity/liquidity/my-liquidity")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>TODO</div>
}
