import { markets } from "@galacticcouncil/money-market/core"
import type { CustomMarket } from "@galacticcouncil/money-market/types"
import { createFileRoute, retainSearchParams } from "@tanstack/react-router"
import z from "zod"

import { MoneyMarketLayout } from "@/modules/money-market/MoneyMarketLayout"

const searchSchema = z.object({
  market: z
    .custom<CustomMarket>(
      (value) => typeof value === "string" && Object.hasOwn(markets, value),
    )
    .optional()
    .catch(undefined),
})

export const Route = createFileRoute("/borrow")({
  component: MoneyMarketLayout,
  validateSearch: searchSchema,
  // breadcrumb links carry only a path, so keep the selected market on them
  search: { middlewares: [retainSearchParams(["market"])] },
  // the layout shows the sub nav or the breadcrumb, never both
  staticData: { crumb: true, pendingNavBar: "subnav" },
})
