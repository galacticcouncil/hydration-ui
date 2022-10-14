import { SItem, SList } from "components/Layout/Header/menu/HeaderMenu.styled"
import { useTranslation } from "react-i18next"
import { MENU_ITEMS } from "utils/tabs"

export const HeaderMenu = () => {
  const { t } = useTranslation("translation")

  return (
    <SList>
      {MENU_ITEMS.map((item, i) => (
        <SItem key={i} isActive={item.active} href={item.href}>
          {t(item.translationKey)}
        </SItem>
      ))}
    </SList>
  )
}
