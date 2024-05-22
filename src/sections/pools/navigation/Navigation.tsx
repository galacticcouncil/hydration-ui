import { theme } from "theme"
import { LINKS } from "utils/navigation"
import UserIcon from "assets/icons/UserIcon.svg?react"
import AllPools from "assets/icons/AllPools.svg?react"
import OmniStablepools from "assets/icons/Omnipool&Stablepool.svg?react"
import IsolatedPools from "assets/icons/IsolatedPools.svg?react"
import { SSeparator } from "components/Separator/Separator.styled"
import { useRpcProvider } from "providers/rpcProvider"
import { useTranslation } from "react-i18next"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import {
  SubNavigation,
  SubNavigationTabLink,
} from "components/Layout/SubNavigation/SubNavigation"
import { BackSubHeader } from "components/Layout/Header/BackSubHeader/BackSubHeader"
import { useLocation } from "@tanstack/react-location"
import { t } from "i18next"
import { useAccountNFTPositions } from "api/deposits"
import { useAccountBalances } from "api/accountBalances"

const routeMap = new Map([
  [LINKS.allPools, t("liquidity.navigation.allPools")],
  [LINKS.myLiquidity, t("liquidity.navigation.myLiquidity")],
  [LINKS.omnipool, t("liquidity.navigation.omnipoolAndStablepool")],
  [LINKS.isolated, t("liquidity.navigation.isolated")],
])

export const Navigation = () => {
  const { t } = useTranslation()
  const { isLoaded } = useRpcProvider()

  return (
    <SubNavigation>
      {isLoaded && <MyLiquidity />}
      <SubNavigationTabLink
        to={LINKS.allPools}
        label={t("liquidity.navigation.allPools")}
        icon={<AllPools width={16} height={16} />}
      />
      <SubNavigationTabLink
        to={LINKS.omnipool}
        label={t("liquidity.navigation.omnipoolAndStablepool")}
        icon={<OmniStablepools width={18} height={18} />}
      />
      <SubNavigationTabLink
        to={LINKS.isolated}
        label={t("liquidity.navigation.isolated")}
        icon={<IsolatedPools width={15} height={15} />}
      />
    </SubNavigation>
  )
}

const MyLiquidity = () => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { assets } = useRpcProvider()
  const accountPositions = useAccountNFTPositions()

  const balances = useAccountBalances(account?.address)

  const isPoolBalances = balances.data?.balances.some((balance) => {
    if (balance.freeBalance.gt(0)) {
      const meta = assets.getAsset(balance.id)
      return meta.isStableSwap || meta.isShareToken
    }
    return false
  })

  const isPositions =
    accountPositions.data?.miningNfts.length ||
    accountPositions.data?.omnipoolNfts.length ||
    isPoolBalances

  if (!isPositions) return null

  return (
    <>
      <SubNavigationTabLink
        to={LINKS.myLiquidity}
        icon={
          <UserIcon style={{ width: 14, height: 14, alignSelf: "center" }} />
        }
        label={t("liquidity.navigation.myLiquidity")}
      />
      <SSeparator
        orientation="vertical"
        sx={{ width: 1, height: "60%", flexShrink: ["0", "inherit"] }}
        css={{
          background: `rgba(${theme.rgbColors.white}, 0.12)`,
        }}
      />
    </>
  )
}

export const PoolNavigation = () => {
  const location = useLocation()
  const { pathname } = location.history.location

  return <BackSubHeader label={`Back to ${routeMap.get(pathname)}`} />
}
