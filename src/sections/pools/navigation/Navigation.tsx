import { Link, useSearch } from "@tanstack/react-location"
import { SNavigationContainer, STabContainer } from "./Navigation.styled"
import { ReactNode } from "react"
import { theme } from "theme"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { LINKS } from "utils/navigation"

import UserIcon from "assets/icons/UserIcon.svg?react"
import AllPools from "assets/icons/AllPools.svg?react"
import OmniStablepools from "assets/icons/Omni&Stablepools.svg?react"
//import IsolatedPools from "assets/icons/PoolsAndFarms.svg?react"
//import LBPPools from "assets/icons/ChartIcon.svg?react"
import { SSeparator } from "components/Separator/Separator.styled"
import { useAccountOmnipoolPositions } from "sections/pools/PoolsPage.utils"
import { useRpcProvider } from "providers/rpcProvider"

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
    >
      {({ isActive }) => (
        <>
          <STabContainer>
            <Icon
              sx={{ color: isActive ? "brightBlue300" : "white" }}
              icon={icon}
            />
            <Text fs={13} color={isActive ? "white" : "iconGray"}>
              {label}
            </Text>
          </STabContainer>
          {isActive && (
            <div
              sx={{ height: 1, bg: "brightBlue300", width: "100%" }}
              css={{ position: "relative", bottom: 0 }}
            />
          )}
        </>
      )}
    </Link>
  )
}

export const Navigation = () => {
  const { isLoaded } = useRpcProvider()
  return (
    <SNavigationContainer>
      {isLoaded && <MyLiquidity />}
      <Tab to={LINKS.allPools} label="All pools" icon={<AllPools />} />
      <Tab
        to={LINKS.omnipool}
        label="Omnipool & Stablepool"
        icon={<OmniStablepools />}
      />
      {/*<Tab
        to={LINKS.isolated}
        label="Isolated pools"
        icon={<IsolatedPools />}
      />
      <Tab to={LINKS.lbp} label="LBP Pools" icon={<LBPPools />} />*/}
    </SNavigationContainer>
  )
}

const MyLiquidity = () => {
  const accountPositions = useAccountOmnipoolPositions()

  const isOmnipoolPositions =
    accountPositions.data?.miningNfts.length ||
    accountPositions.data?.omnipoolNfts.length

  if (!isOmnipoolPositions) return null

  return (
    <>
      <Tab to={LINKS.myLiquidity} icon={<UserIcon />} label="My liquidity" />
      <SSeparator
        orientation="vertical"
        sx={{ width: 1, height: "60%" }}
        css={{ background: `rgba(${theme.rgbColors.white}, 0.12)` }}
      />
    </>
  )
}
