import { TabLink } from "components/Tabs/TabLink"
import { useTranslation } from "react-i18next"
import { STAKING_TABS } from "./Tabs.utils"
import { useMedia } from "react-use"
import { theme } from "theme"

export const Tabs = () => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  return (
    <div
      sx={{
        flex: "row",
        gap: 10,
      }}
    >
      {STAKING_TABS.map((tab) => (
        <TabLink
          key={tab.id}
          to={tab.link}
          icon={tab.icon}
          fullWidth={!isDesktop}
        >
          {t(`staking.tabs.${tab.id}`)}
        </TabLink>
      ))}
    </div>
  )
}
