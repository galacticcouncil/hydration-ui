import { useVestingTotalVestedAmount } from "api/vesting"
import AssetsIcon from "assets/icons/AssetsIcon.svg?react"
import PositionsIcon from "assets/icons/PositionsIcon.svg?react"
import StrategyIcon from "assets/icons/StrategyIcon.svg?react"
import TransferIcon from "assets/icons/TransferIcon.svg?react"
import {
  SubNavigation,
  SubNavigationTabLink,
} from "components/Layout/SubNavigation/SubNavigation"
import { useTranslation } from "react-i18next"
import { LINKS } from "utils/navigation"

const isDevelopment = import.meta.env.VITE_ENV === "development"

export const Navigation = () => {
  const { t } = useTranslation()
  const { data: totalVestedAmount } = useVestingTotalVestedAmount()

  const visibilityMap: Record<string, boolean> = {
    [LINKS.walletAssets]: true,
    [LINKS.walletStrategy]: true,
    [LINKS.walletTransactions]: isDevelopment,
    [LINKS.walletVesting]: !!totalVestedAmount?.gt(0),
  }

  if (Object.values(visibilityMap).filter(Boolean).length <= 1) {
    return null
  }

  return (
    <SubNavigation>
      <SubNavigationTabLink
        to={LINKS.walletAssets}
        icon={<AssetsIcon width={15} height={15} />}
        label={t("header.wallet.yourAssets.title")}
      />
      <SubNavigationTabLink
        to={LINKS.walletStrategy}
        icon={<StrategyIcon width={18} height={18} />}
        label={t("header.wallet.strategy.title")}
      />
      {visibilityMap[LINKS.walletTransactions] && (
        <SubNavigationTabLink
          to={LINKS.walletTransactions}
          icon={<TransferIcon width={18} height={18} />}
          label={t("header.wallet.transactions.title")}
        />
      )}
      {visibilityMap[LINKS.walletVesting] && (
        <SubNavigationTabLink
          to={LINKS.walletVesting}
          icon={<PositionsIcon width={18} height={18} />}
          label={t("header.wallet.vesting.title")}
        />
      )}
    </SubNavigation>
  )
}
