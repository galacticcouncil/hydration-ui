import { useAccount } from "@galacticcouncil/web3-connect"
import { createFileRoute, useMatch } from "@tanstack/react-router"
import { FC } from "react"

import { getPageMeta } from "@/config/navigation"
import { SubpageLayout } from "@/modules/layout/SubpageLayout"
import { PortfolioOverviewSubpageLayoutActions } from "@/modules/portfolio/overview/PortfolioOverviewSubpageLayoutActions"

const PortfolioSubpageLayout: FC = () => {
  const { account } = useAccount()

  const isOverviewPage = useMatch({
    from: "/portfolio/",
    shouldThrow: false,
  })

  const isTrackedPage = useMatch({
    from: "/portfolio/tracked",
    shouldThrow: false,
  })

  const showActions = (isOverviewPage || isTrackedPage) && account

  return (
    <SubpageLayout
      actions={showActions && <PortfolioOverviewSubpageLayoutActions />}
    />
  )
}

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
