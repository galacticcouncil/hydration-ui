import {
  MonitorIcon,
  MoonIcon,
  SunIcon,
} from "@galacticcouncil/ui/assets/icons"
import {
  MenuItem,
  MenuItemAction,
  MenuItemDescription,
  MenuItemIcon,
  MenuItemLabel,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
} from "@galacticcouncil/ui/components"
import {
  ThemePreference as ThemePreferenceType,
  useBreakpoints,
  useTheme,
} from "@galacticcouncil/ui/theme"
import { createElement } from "react"
import { FC } from "react"
import { useTranslation } from "react-i18next"

const getIconByTheme = (theme: ThemePreferenceType) => {
  switch (theme) {
    case "light":
      return SunIcon
    case "dark":
      return MoonIcon
    case "system":
      return MonitorIcon
  }
}

const themeOptions: ThemePreferenceType[] = ["light", "dark", "system"]

export const ThemePreference: FC = () => {
  const { t } = useTranslation()
  const { themePreference, setThemePreference } = useTheme()
  const { isMobile } = useBreakpoints()

  return (
    <MenuItem>
      <MenuItemIcon component={getIconByTheme(themePreference)} />
      <MenuItemLabel>{t("theme.title")}</MenuItemLabel>
      <MenuItemDescription>
        {t("theme.description", {
          theme: t(`theme.${themePreference}`),
        })}
      </MenuItemDescription>
      <MenuItemAction>
        <ToggleGroup
          type="single"
          size="small"
          value={themePreference}
          onValueChange={(value) => setThemePreference(value)}
        >
          {themeOptions.map((theme) => (
            <ToggleGroupItem key={theme} value={theme}>
              <Tooltip
                text={isMobile ? undefined : t(`theme.${theme}`)}
                side="top"
                sideOffset={10}
                asChild
              >
                {createElement(getIconByTheme(theme))}
              </Tooltip>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </MenuItemAction>
    </MenuItem>
  )
}
