import { TabLink } from "components/Tabs/TabLink"
import { useTranslation } from "react-i18next"
import { LINKS } from "utils/navigation"
import { ReactComponent as AssetsIcon } from "assets/icons/AssetsIcon.svg"
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
