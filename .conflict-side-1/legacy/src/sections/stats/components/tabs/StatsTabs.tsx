import { TabLink } from "components/Tabs/TabLink"
import { useTranslation } from "react-i18next"
import { SContainer } from "./StatsTabs.styled"
import { STATS_TABS } from "./StatsTabs.utils"
import { Icon } from "components/Icon/Icon"

export const StatsTabs = () => {
  const { t } = useTranslation()

  return (
    <SContainer>
      {STATS_TABS.map((tab) => (
        <TabLink
          key={tab.id}
          to={tab.link}
          icon={<Icon size={14} icon={tab.icon} />}
        >
          {t(`stats.tabs.${tab.id}`)}
        </TabLink>
      ))}
    </SContainer>
  )
}
