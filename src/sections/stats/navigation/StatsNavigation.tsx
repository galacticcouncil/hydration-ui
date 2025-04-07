import {
  SubNavigation,
  SubNavigationTabLink,
} from "components/Layout/SubNavigation/SubNavigation"
import { useTranslation } from "react-i18next"
import { MENU_ITEMS } from "utils/navigation"

export const StatsNavigation = () => {
  const { t } = useTranslation()

  const subItems = MENU_ITEMS.find((item) => item.key === "stats")?.subItems

  if (!subItems) return null

  return (
    <SubNavigation>
      {subItems.map(({ key, href, Icon }) => (
        <SubNavigationTabLink
          key={key}
          to={href}
          icon={<Icon width={15} height={15} />}
          label={t(`header.${key}.title`)}
        />
      ))}
    </SubNavigation>
  )
}
