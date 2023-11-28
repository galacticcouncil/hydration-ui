import { Navigate } from "@tanstack/react-location"
import { Page } from "components/Layout/Page/Page"
import { Spacer } from "components/Spacer/Spacer"
import { PageHeading } from "components/Layout/PageHeading"
import { useTranslation } from "react-i18next"
import { StakingDashboard } from "./sections/dashboard/StakingDashboard"

const pageEnabled = import.meta.env.VITE_FF_STAKING_ENABLED === "true"

export const StakingPage = () => {
  const { t } = useTranslation()

  if (!pageEnabled) return <Navigate to="/trade" />

  return (
    <Page>
      <PageHeading>{t("staking.title")}</PageHeading>
      <Spacer size={[20, 30]} />
      <StakingDashboard />
    </Page>
  )
}
