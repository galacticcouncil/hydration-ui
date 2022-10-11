import { SItem, SList } from "components/Layout/Header/menu/HeaderMenu.styled"
import { useTranslation } from "react-i18next"
import { EXTERNAL_LINKS } from "utils/links"

export const HeaderMenu = () => {
  const { t } = useTranslation("translation")

  const items = [
    { text: t("header.lbp"), href: EXTERNAL_LINKS.lbp },
    { text: t("header.trade"), href: EXTERNAL_LINKS.swap },
    { text: t("header.wallet"), href: EXTERNAL_LINKS.wallet },
    { text: t("header.pools"), href: "/", isActive: true },
    { text: t("header.bridge"), href: EXTERNAL_LINKS.bridge },
  ]

  return (
    <SList>
      {items.map((item, i) => (
        <SItem key={i} isActive={item.isActive} href={item.href}>
          {item.text}
        </SItem>
      ))}
    </SList>
  )
}
