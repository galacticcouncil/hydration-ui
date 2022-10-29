import { LINKS } from "utils/navigation"
import { TabLink } from "components/Tabs/TabLink"
import { useTranslation } from "react-i18next"

import { ReactComponent as AssetsIcon } from "assets/icons/AssetsIcon.svg"
import { ReactComponent as TransactionsIcon } from "assets/icons/TransactionsIcon.svg"
import { ReactComponent as PositionsIcon } from "assets/icons/PositionsIcon.svg"

export const WalletTabs = () => {
  const { t } = useTranslation()

  return (
    <div
      sx={{
        display: "flex",
        mt: 18,
        gap: 10,
      }}
    >
      <TabLink to={LINKS.walletAssets} icon={<AssetsIcon />}>
        {t("wallet.header.assets")}
      </TabLink>
      <TabLink to={LINKS.walletTransactions} icon={<TransactionsIcon />}>
        {t("wallet.header.transactions")}
      </TabLink>
      <TabLink to={LINKS.walletVesting} icon={<PositionsIcon />}>
        {t("wallet.header.vesting")}
      </TabLink>
    </div>
  )
}
