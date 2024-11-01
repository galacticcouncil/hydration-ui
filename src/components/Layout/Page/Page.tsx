import { Outlet, useMatchRoute, useSearch } from "@tanstack/react-location"
import { BackSubHeader } from "components/Layout/Header/BackSubHeader/BackSubHeader"
import { Header } from "components/Layout/Header/Header"
import { MobileNavBar } from "components/Layout/Header/MobileNavBar/MobileNavBar"
import { Suspense, lazy } from "react"
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

type Props = {
  className?: string
}

const ReferralsConnectWrapper = lazy(async () => ({
  default: (await import("sections/referrals/ReferralsConnectWrapper"))
    .ReferralsConnectWrapper,
}))

const Transactions = lazy(async () => ({
  default: (await import("sections/transaction/Transactions")).Transactions,
}))

const Web3Connect = lazy(async () => ({
  default: (await import("sections/web3-connect/Web3Connect")).Web3Connect,
}))

const QuerySubscriptions = lazy(async () => ({
  default: (await import("api/subscriptions")).QuerySubscriptions,
}))

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

  if (matchRoute({ to: LINKS.statsOmnipool })) {
    return <BackSubHeader label={t("stats.omnipool.navigation.back")} />
  }

  if (
    matchRoute({ to: LINKS.lending }) ||
    matchRoute({ to: LINKS.lendingMarkets })
  ) {
    return <LendingNavigation />
  }

  if (matchRoute({ to: LINKS.lendingMarkets, fuzzy: true })) {
    return prevUrl === LINKS.lendingMarkets ? (
      <BackSubHeader
        label={t("lending.navigation.markets.back")}
        to={LINKS.lendingMarkets}
      />
    ) : (
      <BackSubHeader
        label={t("lending.navigation.dashboard.back")}
        to={LINKS.lending}
      />
    )
  }
}

export const Page = ({ className }: Props) => {
  const matchRoute = useMatchRoute()
  const ref = useControlScroll()
  const subHeaderComponent = useSubheaderComponent()

  const flippedBg = !!matchRoute({ to: LINKS.memepad })

  return (
    <>
      <SPage ref={ref}>
        <SGradientBg flipped={flippedBg} />
        <Header />
        <SPageContent>
          {subHeaderComponent && <SSubHeader>{subHeaderComponent}</SSubHeader>}
          <SPageInner className={className}>
            <Outlet />
          </SPageInner>
        </SPageContent>
        <MobileNavBar />
      </SPage>
      <Suspense>
        <Web3Connect />
        <Transactions />
        <ReferralsConnectWrapper />
        <QuerySubscriptions />
      </Suspense>
    </>
  )
}
