import { Moon } from "@galacticcouncil/ui/assets/icons"
import {
  MenuItem,
  MenuItemAction,
  MenuItemIcon,
  MenuItemLabel,
  Toggle,
  ToggleLabel,
  ToggleRoot,
} from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export const DarkMode: FC = () => {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()

  return (
    <MenuItem>
      <MenuItemIcon component={Moon} />
      <MenuItemLabel>{t("darkMode")}</MenuItemLabel>
      <MenuItemAction>
        <ToggleRoot>
          <ToggleLabel>{t("off")}</ToggleLabel>
          <Toggle
            checked={theme === "dark"}
            onCheckedChange={(isDark) => setTheme(isDark ? "dark" : "light")}
          />
        </ToggleRoot>
      </MenuItemAction>
    </MenuItem>
  )
}
