import { useLocation } from "@tanstack/react-location"
import AllPools from "assets/icons/AllPools.svg?react"
import IsolatedPools from "assets/icons/IsolatedPools.svg?react"
import OmniStablepools from "assets/icons/Omnipool&Stablepool.svg?react"
import { BackSubHeader } from "components/Layout/Header/BackSubHeader/BackSubHeader"
import {
  SubNavigation,
  SubNavigationTabLink,
} from "components/Layout/SubNavigation/SubNavigation"
import { t } from "i18next"
import { Suspense, lazy } from "react"
import { useTranslation } from "react-i18next"
import { LINKS } from "utils/navigation"

const MyLiquidityTabLink = lazy(async () => ({
  default: (await import("./MyLiquidityTabLink")).MyLiquidityTabLink,
}))

const routeMap = new Map([
  [LINKS.allPools, t("header.liquidity.allPools.title")],
  [LINKS.myLiquidity, t("header.liquidity.myLiquidity.title")],
  [LINKS.omnipool, t("header.liquidity.omnipoolAndStablepool.title")],
  [LINKS.isolated, t("header.liquidity.isolated.title")],
])

export const Navigation = () => {
  const { t } = useTranslation()

  return (
    <SubNavigation>
      <Suspense>
        <MyLiquidityTabLink />
      </Suspense>
      <SubNavigationTabLink
        to={LINKS.allPools}
        label={t("header.liquidity.allPools.title")}
        icon={<AllPools width={16} height={16} />}
      />
      <SubNavigationTabLink
        to={LINKS.omnipool}
        label={t("header.liquidity.omnipoolAndStablepool.title")}
        icon={<OmniStablepools width={18} height={18} />}
      />
      <SubNavigationTabLink
        to={LINKS.isolated}
        label={t("header.liquidity.isolated.title")}
        icon={<IsolatedPools width={15} height={15} />}
      />
    </SubNavigation>
  )
}

export const PoolNavigation = () => {
  const location = useLocation()
  const { pathname } = location.history.location

  return <BackSubHeader label={`Back to ${routeMap.get(pathname)}`} />
}
