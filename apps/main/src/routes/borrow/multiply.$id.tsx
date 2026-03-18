import { createFileRoute, notFound } from "@tanstack/react-router"
import { useCallback } from "react"
import z from "zod"

import { getPageMeta } from "@/config/navigation"
import {
  MULTIPLY_ASSETS_CONFIG,
  MULTIPLY_STRATEGIES_BY_ID,
  type MultiplyStrategyId,
} from "@/modules/borrow/multiply/config/pairs"
import { MultiplyPairDetailPage } from "@/modules/borrow/multiply/MultiplyPairDetailPage"
import { MultiplyStrategyDetailPage } from "@/modules/borrow/multiply/MultiplyStrategyDetailPage"

const searchSchema = z.object({ pairId: z.string().optional() })

const RouteComponent = () => {
  const data = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const onPairIdChange = useCallback(
    (pairId: string) => navigate({ search: { pairId }, replace: true }),
    [navigate],
  )
  if (data.type === "strategy") {
    return (
      <MultiplyStrategyDetailPage
        strategy={data.strategy}
        pairIdFromSearch={search.pairId}
        onPairIdChange={onPairIdChange}
      />
    )
  }

  return <MultiplyPairDetailPage config={data.config} />
}

export const Route = createFileRoute("/borrow/multiply/$id")({
  validateSearch: searchSchema,
  component: RouteComponent,
  loader: ({ params }) => {
    const strategy = MULTIPLY_STRATEGIES_BY_ID[params.id as MultiplyStrategyId]
    if (strategy) return { type: "strategy" as const, strategy }

    const config = MULTIPLY_ASSETS_CONFIG.find((c) => c.id === params.id)
    if (config) return { type: "pair" as const, config }

    throw notFound()
  },
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("borrowMultiply", i18n.t),
  }),
})
