import { Page } from "components/Layout/Page/Page"
import {
  SubNavigation,
  SubNavigationTabLink,
} from "components/Layout/SubNavigation/SubNavigation"
import { Outlet, useMatchRoute } from "@tanstack/react-location"
import { LINKS } from "utils/navigation"
import { BackSubHeader } from "components/Layout/Header/BackSubHeader/BackSubHeader"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"
import IconDCA from "assets/icons/navigation/IconDCA.svg?react"
import IconOTC from "assets/icons/navigation/IconOTC.svg?react"
import IconSwap from "assets/icons/navigation/IconSwap.svg?react"
import { useRpcProvider } from "providers/rpcProvider"
import { BondsSubNavigationTabLink } from "sections/trade/BondsSubNavigationTabLink"

const isOtcPageEnabled = import.meta.env.VITE_FF_OTC_ENABLED === "true"
const isDcaPageEnabled = import.meta.env.VITE_FF_DCA_ENABLED === "true"
const isBondsPageEnabled = import.meta.env.VITE_FF_BONDS_ENABLED === "true"

export const TradePage = () => {
  const { t } = useTranslation()
  const matchRoute = useMatchRoute()
  const isBondPage = matchRoute({ to: LINKS.bond })
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const { isLoaded } = useRpcProvider()

  return (
    <Page
      subHeader={
        isBondPage ? (
          <BackSubHeader
            label={isDesktop ? t("bonds.details.navigation.label") : ""}
            to={LINKS.bonds}
          />
        ) : isDesktop ? (
          <SubNavigation>
            <SubNavigationTabLink
              to={LINKS.swap}
              icon={<IconSwap />}
              label={t("header.trade.swap.title")}
            />
            {isOtcPageEnabled && (
              <SubNavigationTabLink
                to={LINKS.otc}
                icon={<IconOTC />}
                label={t("header.trade.otc.title")}
              />
            )}
            {isDcaPageEnabled && (
              <SubNavigationTabLink
                to={LINKS.dca}
                icon={<IconDCA />}
                label={t("header.trade.dca.title")}
              />
            )}
            {isBondsPageEnabled && isLoaded && <BondsSubNavigationTabLink />}
          </SubNavigation>
        ) : null
      }
      subHeaderStyle={
        !isBondPage && {
          background: "rgba(9, 9, 9, 0.09)",
          borderTop: "1px solid rgba(114, 131, 165, 0.6)",
        }
      }
    >
      <Outlet />
    </Page>
  )
}
