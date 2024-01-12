import AssetsIcon from "assets/icons/AssetsIcon.svg?react"
import PositionsIcon from "assets/icons/PositionsIcon.svg?react"
import TransferIcon from "assets/icons/TransferIcon.svg?react"
import {
  SubNavigation,
  SubNavigationTabLink,
} from "components/Layout/SubNavigation/SubNavigation"
import { useTranslation } from "react-i18next"
import { LINKS } from "utils/navigation"

export const Navigation = () => {
  const { t } = useTranslation()
  return (
    <SubNavigation>
      <SubNavigationTabLink
        to={LINKS.walletAssets}
        icon={<AssetsIcon width={15} height={15} />}
        label={t("wallet.header.yourAssets")}
      />
      <SubNavigationTabLink
        to={LINKS.walletVesting}
        icon={<PositionsIcon width={18} height={18} />}
        label={t("wallet.header.vesting")}
      />
      <SubNavigationTabLink
        to={LINKS.walletTransactions}
        icon={<TransferIcon width={18} height={18} />}
        label={t("wallet.header.transactions")}
      />
    </SubNavigation>
  )
}
