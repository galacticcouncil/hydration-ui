import { Link, useSearch } from "@tanstack/react-location"
import { SItem, SList } from "components/Layout/Header/menu/HeaderMenu.styled"
import { useTranslation } from "react-i18next"
import { MENU_ITEMS } from "utils/navigation"
import { HeaderSubMenu } from "./HeaderSubMenu"

export const HeaderMenu = () => {
  const { t } = useTranslation()
  const { account } = useSearch()

  return (
    <SList>
      {MENU_ITEMS.map((item, i) => {
        if (!item.enabled) {
          return null
        }

        if (item.subItems?.length) {
          return <HeaderSubMenu key={i} item={item} />
        }

        if (item.external) {
          return (
            <a href={item.href} key={i}>
              <SItem>{t(`header.${item.key}`)}</SItem>
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
              <SItem isActive={isActive}>{t(`header.${item.key}`)}</SItem>
            )}
          </Link>
        )
      })}
    </SList>
  )
}
