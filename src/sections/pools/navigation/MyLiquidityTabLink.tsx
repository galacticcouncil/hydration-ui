import { useAccountData } from "api/deposits"
import UserIcon from "assets/icons/UserIcon.svg?react"
import { SubNavigationTabLink } from "components/Layout/SubNavigation/SubNavigation"
import { SSeparator } from "components/Separator/Separator.styled"
import { useShallow } from "hooks/useShallow"
import { useRpcProvider } from "providers/rpcProvider"
import { useTranslation } from "react-i18next"
import { theme } from "theme"
import { LINKS } from "utils/navigation"

export const MyLiquidity = () => {
  const { t } = useTranslation()
  const isPositions = useAccountData(useShallow((state) => state.isPositions))

  if (!isPositions) return null

  return (
    <>
      <SubNavigationTabLink
        to={LINKS.myLiquidity}
        icon={
          <UserIcon style={{ width: 14, height: 14, alignSelf: "center" }} />
        }
        label={t("header.liquidity.myLiquidity.title")}
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
