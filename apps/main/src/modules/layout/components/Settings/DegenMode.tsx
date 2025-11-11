import { CircleInfo, IconPlaceholder } from "@galacticcouncil/ui/assets/icons"
import {
  MenuItem,
  MenuItemAction,
  MenuItemDescription,
  MenuItemIcon,
  MenuItemLabel,
  Toggle,
  ToggleLabel,
  ToggleRoot,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { doNothing } from "remeda"

export const DegenMode: FC = () => {
  const { t } = useTranslation()

  return (
    <MenuItem>
      <MenuItemIcon
        component={IconPlaceholder}
        sx={{ color: getToken("buttons.secondary.emphasis.onRest") }}
      />
      <MenuItemLabel>
        {t("degenMode")} <CircleInfo />
      </MenuItemLabel>
      <MenuItemDescription>{t("degenMode.warning")}</MenuItemDescription>
      <MenuItemAction>
        <ToggleRoot>
          <ToggleLabel>{t("off")}</ToggleLabel>
          <Toggle checked={false} onCheckedChange={doNothing} />
        </ToggleRoot>
      </MenuItemAction>
    </MenuItem>
  )
}
