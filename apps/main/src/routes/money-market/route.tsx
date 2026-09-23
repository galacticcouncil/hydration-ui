import { markets } from "@galacticcouncil/money-market-v2/core"
import type { CustomMarket } from "@galacticcouncil/money-market-v2/types"
import { createFileRoute, retainSearchParams } from "@tanstack/react-router"
import z from "zod"

import { MoneyMarketV2Layout } from "@/modules/money-market-v2/MoneyMarketV2Layout"

const searchSchema = z.object({
  market: z
    .custom<CustomMarket>(
      (value) => typeof value === "string" && Object.hasOwn(markets, value),
    )
    .optional()
    .catch(undefined),
})

export const Route = createFileRoute("/money-market")({
  component: MoneyMarketV2Layout,
  validateSearch: searchSchema,
  // breadcrumb links carry only a path, so keep the selected market on them
  search: { middlewares: [retainSearchParams(["market"])] },
  staticData: { crumb: () => "Money market" },
})
