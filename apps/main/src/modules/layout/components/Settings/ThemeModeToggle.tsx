import {
  MonitorIcon,
  MoonIcon,
  SunIcon,
} from "@galacticcouncil/ui/assets/icons"
import { ButtonIcon, Icon, Tooltip } from "@galacticcouncil/ui/components"
import { ThemePreference, useTheme } from "@galacticcouncil/ui/theme"
import { FC } from "react"
import { useTranslation } from "react-i18next"

const themeOptions: ThemePreference[] = ["light", "dark", "system"]

const getIconByTheme = (theme: ThemePreference) => {
  switch (theme) {
    case "light":
      return SunIcon
    case "dark":
      return MoonIcon
    case "system":
      return MonitorIcon
  }
}

const getNextTheme = (theme: ThemePreference) => {
  const index = themeOptions.indexOf(theme)

  return themeOptions[(index + 1) % themeOptions.length] ?? "system"
}

export const ThemeModeToggle: FC = () => {
  const { t } = useTranslation()
  const { themePreference, setThemePreference } = useTheme()
  const currentThemeLabel = t(`theme.${themePreference}`)

  return (
    <Tooltip
      asChild
      text={t("theme.description", { theme: currentThemeLabel })}
      side="bottom"
    >
      <ButtonIcon
        aria-label={t("theme.description", { theme: currentThemeLabel })}
        onClick={() => setThemePreference(getNextTheme(themePreference))}
      >
        <Icon component={getIconByTheme(themePreference)} size="l" />
      </ButtonIcon>
    </Tooltip>
  )
}
