import { useMatchRoute } from "@tanstack/react-location"
import { Page } from "components/Layout/Page/Page"
import { Spacer } from "components/Spacer/Spacer"
import { Heading } from "components/Typography/Heading/Heading"
import { useTranslation } from "react-i18next"
import { LINKS } from "utils/navigation"
import { StatsLRNA } from "./LRNA/StatsLRNA"
import { StatsPOL } from "./POL/StatsPOL"
import { StatsOverview } from "./overview/StatsOverview"
import { StatsTabs } from "./tabs/StatsTabs"

export const StatsPage = () => {
  const { t } = useTranslation()
  const matchRoute = useMatchRoute()

  return (
    <Page variant="stats">
      <Heading as="h1" fs={30} lh={30} fw={500}>
        {t("stats.title")}
      </Heading>
      <Spacer size={42} />
      <StatsTabs />
      <Spacer size={30} />
      {matchRoute({ to: LINKS.statsOverview }) && <StatsOverview />}
      {matchRoute({ to: LINKS.statsPOL }) && <StatsPOL />}
      {matchRoute({ to: LINKS.statsLRNA }) && <StatsLRNA />}
    </Page>
  )
}
