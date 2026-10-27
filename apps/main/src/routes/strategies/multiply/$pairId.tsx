import { createFileRoute, useParams } from "@tanstack/react-router"

import { MultiplyPage } from "@/modules/strategies/multiply/MultiplyPage"

const RouteComponent = () => {
  const { pairId } = useParams({ from: "/strategies/multiply/$pairId" })

  return <MultiplyPage pairId={pairId} />
}

export const Route = createFileRoute("/strategies/multiply/$pairId")({
  component: RouteComponent,
})
