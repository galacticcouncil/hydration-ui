import { Navigate, useMatchRoute } from "@tanstack/react-location"
import { Page } from "components/Layout/Page/Page"
import { Spacer } from "components/Spacer/Spacer"
import { Heading } from "components/Typography/Heading/Heading"
import { useTranslation } from "react-i18next"
import { LINKS } from "utils/navigation"
import { Tabs } from "./components/Tabs/Tabs"
import { StakingDashboard } from "./sections/dashboard/StakingDashboard"

const pageEnabled = import.meta.env.VITE_FF_STAKING_ENABLED === "true"

export const StakingPage = () => {
  const { t } = useTranslation()
  const matchRoute = useMatchRoute()

  if (!pageEnabled) return <Navigate to="/trade" />

  return (
    <Page>
      <Heading as="h1" fs={19} lh={19} fw={500}>
        {t("staking.title")}
      </Heading>
      <Spacer size={40} />
      <Tabs />
      <Spacer size={40} />
      {matchRoute({ to: LINKS.stakingDashboard }) && <StakingDashboard />}
      {matchRoute({ to: LINKS.stakingGovernance }) && <div />}
    </Page>
  )
}
