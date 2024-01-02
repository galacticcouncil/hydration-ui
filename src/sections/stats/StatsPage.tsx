import { Outlet, useMatchRoute } from "@tanstack/react-location"
import { Page } from "components/Layout/Page/Page"
import { useTranslation } from "react-i18next"
import { LINKS } from "utils/navigation"
import { BackSubHeader } from "components/Layout/Header/BackSubHeader/BackSubHeader"

export const StatsPage = () => {
  const { t } = useTranslation()
  const matchRoute = useMatchRoute()

  const isOmnipoolAssetPage = matchRoute({ to: LINKS.statsOmnipool })

  return (
    <Page
      subHeader={
        isOmnipoolAssetPage ? (
          <BackSubHeader label={t("stats.omnipool.navigation.back")} />
        ) : null
      }
    >
      <Outlet />
    </Page>
  )
}
