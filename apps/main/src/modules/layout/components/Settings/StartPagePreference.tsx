import { Grid2X2Icon } from "@galacticcouncil/ui/assets/icons"
import {
  MenuItem,
  MenuItemAction,
  MenuItemDescription,
  MenuItemIcon,
  MenuItemLabel,
  Select,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { startPageOptions, useAppSettingsStore } from "@/states/appSettings"

export const StartPagePreference: FC = () => {
  const { t } = useTranslation()
  const startPage = useAppSettingsStore((state) => state.startPage)
  const setStartPage = useAppSettingsStore((state) => state.setStartPage)

  return (
    <MenuItem>
      <MenuItemIcon component={Grid2X2Icon} />
      <MenuItemLabel>{t("startPage.title")}</MenuItemLabel>
      <MenuItemDescription>{t("startPage.description")}</MenuItemDescription>
      <MenuItemAction>
        <Select
          size="small"
          value={startPage}
          items={startPageOptions.map((option) => ({
            key: option,
            label: t(`startPage.${option}`),
          }))}
          onValueChange={setStartPage}
        />
      </MenuItemAction>
    </MenuItem>
  )
}
