import { useAccountAssets } from "api/deposits"
import UserIcon from "assets/icons/UserIcon.svg?react"
import { SubNavigationTabLink } from "components/Layout/SubNavigation/SubNavigation"
import { SSeparator } from "components/Separator/Separator.styled"
import { useRpcProvider } from "providers/rpcProvider"
import { useTranslation } from "react-i18next"
import { theme } from "theme"
import { LINKS } from "utils/navigation"

export const MyLiquidity = () => {
  const { t } = useTranslation()
  const balances = useAccountAssets()

  const isPoolBalances = balances.data?.isAnyPoolPositions

  if (!isPoolBalances) return null

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

export const MyLiquidityTabLink = () => {
  const { isLoaded } = useRpcProvider()
  return isLoaded ? <MyLiquidity /> : null
}