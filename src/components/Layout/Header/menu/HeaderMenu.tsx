import { SItem, SList } from "components/Layout/Header/menu/HeaderMenu.styled"
import { useTranslation } from "react-i18next"
import { Link, useSearch } from "@tanstack/react-location"
import { MENU_ITEMS } from "utils/navigation"

export const HeaderMenu = () => {
  const { t } = useTranslation("translation")
  const { account } = useSearch()

  return (
    <SList>
      {MENU_ITEMS.map((item, i) => {
        if (!item.enabled) {
          return null
        }

        if (item.external) {
          return (
            <a href={item.href} key={i}>
              <SItem>{t(item.translationKey)}</SItem>
            </a>
          )
        }

        return (
          <Link
            to={item.href}
            search={account ? { account } : undefined}
            key={i}
          >
            {({ isActive }) => (
              <SItem isActive={isActive}>{t(item.translationKey)}</SItem>
            )}
          </Link>
        )
      })}
    </SList>
  )
}
