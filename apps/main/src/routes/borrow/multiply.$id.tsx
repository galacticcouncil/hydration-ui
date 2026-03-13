import { createFileRoute, notFound } from "@tanstack/react-router"

import { MULTIPLY_ASSETS_CONFIG } from "@/modules/borrow/multiply/config"
import { MultiplyDetailPage } from "@/modules/borrow/multiply/MultiplyDetailPage"

const RouteComponent = () => {
  const { config } = Route.useLoaderData()
  return <MultiplyDetailPage config={config} />
}

export const Route = createFileRoute("/borrow/multiply/$id")({
  component: RouteComponent,
  loader: ({ params }) => {
    const config = MULTIPLY_ASSETS_CONFIG.find((c) => c.id === params.id)

    if (!config) {
      throw notFound()
    }

    return { config }
  },
})
