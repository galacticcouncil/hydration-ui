import { Rectangle7101 } from "@galacticcouncil/ui/assets/icons"
import {
  SMenuItemDescription,
  SMenuItemIcon,
  SMenuItemLabel,
  SMenuSelectionItem,
  SMenuSelectionItemArrow,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export const Contacts: FC = () => {
  const { t } = useTranslation()

  return (
    <SMenuSelectionItem>
      <SMenuItemIcon component={Rectangle7101} />
      <SMenuItemLabel>{t("contacts")}</SMenuItemLabel>
      <SMenuItemDescription>{t("contacts.description")}</SMenuItemDescription>
      <SMenuSelectionItemArrow />
    </SMenuSelectionItem>
  )
}
