import { useMatchRoute } from "@tanstack/react-location"
import AssetsIcon from "assets/icons/AssetsIcon.svg?react"
import PositionsIcon from "assets/icons/PositionsIcon.svg?react"
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
            icon={<AssetsIcon width={15} height={15} />}
            label={t("wallet.header.yourAssets")}
          />
          <SubNavigationTabLink
            to={LINKS.walletVesting}
            icon={<PositionsIcon width={18} height={18} />}
            label={t("wallet.header.vesting")}
          />
        </SubNavigation>
      }
      subHeaderStyle={{
        background: "rgba(9, 9, 9, 0.09)",
        borderTop: "1px solid rgba(114, 131, 165, 0.6)",
      }}
    >
      {matchRoute({ to: LINKS.walletVesting }) && <WalletVesting />}
      {matchRoute({ to: LINKS.walletAssets }) && <WalletAssets />}
    </Page>
  )
}
