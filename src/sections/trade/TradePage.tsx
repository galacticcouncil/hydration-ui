import { Page } from "components/Layout/Page/Page"
import { Outlet, useMatchRoute } from "@tanstack/react-location"
import { LINKS } from "utils/navigation"
import { BackSubHeader } from "components/Layout/Header/BackSubHeader/BackSubHeader"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"
import { Navigation } from "sections/trade/navigation/Navigation"

export const TradePage = () => {
  const { t } = useTranslation()
  const matchRoute = useMatchRoute()
  const isBondPage = matchRoute({ to: LINKS.bond })
  const isDesktop = useMedia(theme.viewport.gte.sm)

  return (
    <Page
      subHeader={
        isBondPage ? (
          <BackSubHeader
            label={isDesktop ? t("bonds.details.navigation.label") : ""}
            to={LINKS.bonds}
          />
        ) : isDesktop ? (
          <Navigation />
        ) : null
      }
    >
      <Outlet />
    </Page>
  )
}
