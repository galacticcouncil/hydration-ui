import { createFileRoute, useParams } from "@tanstack/react-router"

import { MultiplyDetailPage } from "@/modules/borrow/multiply/MultiplyDetailPage"

const RouteComponent = () => {
  const params = useParams({
    from: "/borrow/multiply/$id",
  })

  return <MultiplyDetailPage id={params.id} />
}

export const Route = createFileRoute("/borrow/multiply/$id")({
  component: RouteComponent,
})
