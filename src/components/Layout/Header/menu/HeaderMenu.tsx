import { SItem, SList } from "components/Layout/Header/menu/HeaderMenu.styled"
import { useTranslation } from "react-i18next"
import { Link } from "@tanstack/react-location"
import { MENU_ITEMS } from "utils/tabs"

export const HeaderMenu = () => {
  const { t } = useTranslation("translation")

  return (
    <SList>
      {MENU_ITEMS.map((item, i) => {
        if (item.external) {
          return (
            <a href={item.href} key={i}>
              <SItem>{t(item.translationKey)}</SItem>
            </a>
          )
        }

        return (
          <Link to={item.href} key={i}>
            {({ isActive }) => (
              <SItem isActive={isActive}>{t(item.translationKey)}</SItem>
            )}
          </Link>
        )
      })}
    </SList>
  )
}
