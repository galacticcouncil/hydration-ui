import { LINKS } from "utils/navigation"
import { TabLink } from "components/Tabs/TabLink"
import { useTranslation } from "react-i18next"

import { ReactComponent as AssetsIcon } from "assets/icons/AssetsIcon.svg"
import { ReactComponent as PositionsIcon } from "assets/icons/PositionsIcon.svg"
import { useMedia } from "react-use"
import { theme } from "theme"
import { useSearch } from "@tanstack/react-location"

export const WalletTabs = () => {
  const { t } = useTranslation()
  const search = useSearch()
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
        search={search}
        icon={<AssetsIcon />}
        fullWidth={!isDesktop}
      >
        {t("wallet.header.assets")}
      </TabLink>
      <TabLink
        to={LINKS.walletVesting}
        search={search}
        icon={<PositionsIcon />}
        fullWidth={!isDesktop}
      >
        {t("wallet.header.vesting")}
      </TabLink>
    </div>
  )
}
