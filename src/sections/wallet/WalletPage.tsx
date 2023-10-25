import { useMatchRoute } from "@tanstack/react-location"
import DropletIcon from "assets/icons/DropletIcon.svg?react"
import PersonIcon from "assets/icons/PersonIcon.svg?react"
import { Page } from "components/Layout/Page/Page"
import {
  SubNavigation,
  SubNavigationTabLink,
} from "components/Layout/SubNavigation/SubNavigation"
import { useTranslation } from "react-i18next"
import { WalletAssets } from "sections/wallet/assets/WalletAssets"
import { LINKS } from "utils/navigation"
import { WalletVesting } from "./vesting/WalletVesting"

export const WalletPage = () => {
  const { t } = useTranslation()
  const matchRoute = useMatchRoute()

  return (
    <Page
      subHeader={
        <SubNavigation>
          <SubNavigationTabLink
            to={LINKS.walletAssets}
            icon={<PersonIcon width={15} height={15} />}
            label={t("wallet.header.yourAssets")}
          />
          <SubNavigationTabLink
            to={LINKS.walletVesting}
            icon={<DropletIcon width={18} height={18} />}
            label={t("wallet.header.vesting")}
          />
        </SubNavigation>
      }
    >
      {matchRoute({ to: LINKS.walletVesting }) && <WalletVesting />}
      {matchRoute({ to: LINKS.walletAssets }) && <WalletAssets />}
    </Page>
  )
}
