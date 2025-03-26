import { Outlet, useMatchRoute, useSearch } from "@tanstack/react-location"
import { BackSubHeader } from "components/Layout/Header/BackSubHeader/BackSubHeader"
import { Header } from "components/Layout/Header/Header"
import { MobileNavBar } from "components/Layout/Header/MobileNavBar/MobileNavBar"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import {
  PoolNavigation,
  Navigation as PoolsNavigation,
} from "sections/pools/navigation/Navigation"
import { Navigation as TradeNavigation } from "sections/trade/navigation/Navigation"
import { Navigation as WalletNavigation } from "sections/wallet/navigation/Navigation"
import { Navigation as LendingNavigation } from "sections/lending/ui/navigation/Navigation"
import { theme } from "theme"
import { LINKS } from "utils/navigation"
import {
  SGradientBg,
  SPage,
  SPageContent,
  SPageInner,
  SSubHeader,
} from "./Page.styled"
import { useControlScroll } from "./Page.utils"
import { usePreviousUrl } from "hooks/usePreviousUrl"
import { ProviderSelectButton } from "sections/provider/components/ProviderSelectButton/ProviderSelectButton"
import { StatsNavigation } from "sections/stats/navigation/StatsNavigation"

type Props = {
  className?: string
}

const useSubheaderComponent = () => {
  const { t } = useTranslation()
  const matchRoute = useMatchRoute()
  const search = useSearch()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const prevUrl = usePreviousUrl()

  if (matchRoute({ to: LINKS.trade, fuzzy: true })) {
    const isBondPage = matchRoute({ to: LINKS.bond })
    return isBondPage ? (
      <BackSubHeader
        label={isDesktop ? t("bonds.details.navigation.label") : ""}
        to={LINKS.bonds}
      />
    ) : isDesktop ? (
      <TradeNavigation />
    ) : null
  }

  if (matchRoute({ to: LINKS.liquidity, fuzzy: true })) {
    return "id" in search ? <PoolNavigation /> : <PoolsNavigation />
  }

  if (matchRoute({ to: LINKS.wallet, fuzzy: true })) {
    return <WalletNavigation />
  }

  if (matchRoute({ to: LINKS.statsOmnipoolAsset })) {
    return <BackSubHeader label={t("stats.omnipool.navigation.back")} />
  }

  if (matchRoute({ to: LINKS.stats, fuzzy: true })) {
    return <StatsNavigation />
  }

  if (
    matchRoute({ to: LINKS.borrow }) ||
    matchRoute({ to: LINKS.borrowDashboard }) ||
    matchRoute({ to: LINKS.borrowMarkets }) ||
    matchRoute({ to: LINKS.borrowHistory })
  ) {
    return <LendingNavigation />
  }

  if (matchRoute({ to: LINKS.borrowMarkets, fuzzy: true })) {
    return prevUrl === LINKS.borrowMarkets ? (
      <BackSubHeader
        label={t("lending.navigation.markets.back")}
        to={LINKS.borrowMarkets}
      />
    ) : (
      <BackSubHeader
        label={t("lending.navigation.dashboard.back")}
        to={LINKS.borrowDashboard}
      />
    )
  }
}

export const Page = ({ className }: Props) => {
  const ref = useControlScroll()

  return (
    <SPage ref={ref}>
      <Background />
      <Header />
      <SPageContent>
        <SubHeader />
        <SPageInner className={className}>
          <Outlet />
        </SPageInner>
      </SPageContent>
      <MobileNavBar />
      <ProviderSelectButton />
    </SPage>
  )
}

const Background = () => {
  const matchRoute = useMatchRoute()
  const flippedBg = !!matchRoute({ to: LINKS.memepad })

  return <SGradientBg flipped={flippedBg} />
}

const SubHeader = () => {
  const subHeaderComponent = useSubheaderComponent()

  if (!subHeaderComponent) return null

  return <SSubHeader>{subHeaderComponent}</SSubHeader>
}
