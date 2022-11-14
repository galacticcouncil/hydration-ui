import { LINKS } from "utils/navigation"
import { TabLink } from "components/Tabs/TabLink"
import { useTranslation } from "react-i18next"

import { ReactComponent as AssetsIcon } from "assets/icons/AssetsIcon.svg"
//import { ReactComponent as TransactionsIcon } from "assets/icons/TransactionsIcon.svg"
import { ReactComponent as PositionsIcon } from "assets/icons/PositionsIcon.svg"
import { useMedia } from "react-use"
import { theme } from "theme"

export const WalletTabs = () => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  return (
    <div
      sx={{
        flex: "row",
        justify: ["space-between", "start"],
        mt: 18,
        gap: 10,
      }}
    >
      <TabLink
        to={LINKS.walletAssets}
        icon={<AssetsIcon />}
        fullWidth={!isDesktop}
      >
        {t("wallet.header.assets")}
      </TabLink>
      {/* For now it is disabled, since idk if this section will be in Hydra*/}
      {/*<TabLink to={LINKS.walletTransactions} icon={<TransactionsIcon />}>
        {t("wallet.header.transactions")}
    </TabLink>*/}
      <TabLink
        to={LINKS.walletVesting}
        icon={<PositionsIcon />}
        fullWidth={!isDesktop}
      >
        {t("wallet.header.vesting")}
      </TabLink>
    </div>
  )
}
