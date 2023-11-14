import { Link, useSearch } from "@tanstack/react-location"
import { SNavigationContainer, STabContainer } from "./Navigation.styled"
import { ReactNode } from "react"
import { theme } from "theme"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { LINKS } from "utils/navigation"

import UserIcon from "assets/icons/UserIcon.svg?react"
import AllPools from "assets/icons/DropletIcon.svg?react"
import OmniStablepools from "assets/icons/WaterRippleIcon.svg?react"
import IsolatedPools from "assets/icons/PoolsAndFarms.svg?react"
import { SSeparator } from "components/Separator/Separator.styled"
import { useAccountOmnipoolPositions } from "sections/pools/PoolsPage.utils"
import { useRpcProvider } from "providers/rpcProvider"
import { useTranslation } from "react-i18next"
import { useTokensBalances } from "api/balances"
import { useAccountStore } from "state/store"
import { BackSubHeader } from "components/Layout/Header/BackSubHeader/BackSubHeader"

const Tab = ({
  to,
  icon,
  label,
}: {
  to: string
  icon: ReactNode
  label: string
}) => {
  const search = useSearch()

  return (
    <Link
      to={to}
      search={search}
      css={{
        "&:hover > div > p": { color: theme.colors.white },
        height: "100%",
      }}
      sx={{ px: 4 }}
    >
      {({ isActive }) => (
        <>
          <STabContainer>
            <Icon
              sx={{ color: isActive ? "brightBlue300" : "white" }}
              icon={icon}
              size={20}
            />
            <Text
              fs={13}
              color={isActive ? "white" : "iconGray"}
              css={{ whiteSpace: "nowrap" }}
            >
              {label}
            </Text>
          </STabContainer>
          {isActive && (
            <div
              sx={{ height: 1, bg: "brightBlue300", width: "100%" }}
              css={{ position: "relative", bottom: 1 }}
            />
          )}
        </>
      )}
    </Link>
  )
}

export const Navigation = () => {
  const { t } = useTranslation()
  const { isLoaded } = useRpcProvider()

  return (
    <SNavigationContainer>
      {isLoaded && <MyLiquidity />}
      <Tab
        to={LINKS.allPools}
        label={t("liquidity.navigation.allPools")}
        icon={<AllPools />}
      />
      <Tab
        to={LINKS.omnipool}
        label={t("liquidity.navigation.omnipoolAndStablepool")}
        icon={<OmniStablepools />}
      />
      <Tab
        to={LINKS.isolated}
        label={t("liquidity.navigation.isolated")}
        icon={<IsolatedPools />}
      />
    </SNavigationContainer>
  )
}

const MyLiquidity = () => {
  const { t } = useTranslation()
  const { account } = useAccountStore()
  const { assets } = useRpcProvider()
  const accountPositions = useAccountOmnipoolPositions()

  const shareTokensId = assets.shareTokens.map((shareToken) => shareToken.id)
  const stableswapsId = assets.stableswap.map((shareToken) => shareToken.id)

  const userPositions = useTokensBalances(
    [...shareTokensId, ...stableswapsId],
    account?.address,
  )

  const isOmnipoolPositions =
    accountPositions.data?.miningNfts.length ||
    accountPositions.data?.omnipoolNfts.length ||
    userPositions.some((userPosition) => userPosition.data?.freeBalance.gt(0))

  if (!isOmnipoolPositions) return null

  return (
    <>
      <Tab
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
  return <BackSubHeader label="Pool Detail" />
}
