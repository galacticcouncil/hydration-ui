import { theme } from "theme"
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
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import {
  SubNavigation,
  SubNavigationTabLink,
} from "components/Layout/SubNavigation/SubNavigation"
import { BackSubHeader } from "components/Layout/Header/BackSubHeader/BackSubHeader"

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
  return <BackSubHeader label="Back Pool Details" />
}
