import AssetsIcon from "assets/icons/AssetsIcon.svg?react"
import UserIcon from "assets/icons/UserIcon.svg?react"
import {
  SubNavigation,
  SubNavigationTabLink,
} from "components/Layout/SubNavigation/SubNavigation"
import { useTranslation } from "react-i18next"
import { ROUTES } from "sections/lending/components/primitives/Link"

export const Navigation = () => {
  const { t } = useTranslation()
  return (
    <SubNavigation>
      <SubNavigationTabLink
        to={ROUTES.dashboard}
        icon={<UserIcon width={14} height={14} />}
        label={t("header.borrow.dashboard.title")}
      />
      <SubNavigationTabLink
        to={ROUTES.markets}
        icon={<AssetsIcon width={15} height={15} />}
        label={t("header.borrow.markets.title")}
      />
    </SubNavigation>
  )
}
