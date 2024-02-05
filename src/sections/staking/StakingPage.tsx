import { Page } from "components/Layout/Page/Page"
import { Spacer } from "components/Spacer/Spacer"
import { PageHeading } from "components/Layout/PageHeading"
import { useTranslation } from "react-i18next"
import { StakingDashboard } from "./sections/dashboard/StakingDashboard"

export const StakingPage = () => {
  const { t } = useTranslation()

  return (
    <Page>
      <PageHeading>{t("staking.title")}</PageHeading>
      <Spacer size={[20, 30]} />
      <StakingDashboard />
    </Page>
  )
}
