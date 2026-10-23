import { createFileRoute } from "@tanstack/react-router"
import { FC } from "react"

import { getPageMeta } from "@/config/navigation"
import { SubpageLayout } from "@/modules/layout/SubpageLayout"
import { PortfolioOverviewSubpageLayoutActions } from "@/modules/portfolio/overview/PortfolioOverviewSubpageLayoutActions"

const PortfolioSubpageLayout: FC = () => (
  <SubpageLayout actions={<PortfolioOverviewSubpageLayoutActions />} />
)

export const Route = createFileRoute("/portfolio")({
  component: PortfolioSubpageLayout,
  staticData: { showSubNav: true },
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("portfolio", i18n.t),
  }),
})
