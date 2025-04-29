import { HelpIcon, Rectangle7101 } from "@galacticcouncil/ui/assets/icons"
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
import { noop } from "@polkadot/util"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export const DegenMode: FC = () => {
  const { t } = useTranslation()

  return (
    <MenuItem>
      <MenuItemIcon
        component={Rectangle7101}
        sx={{ color: getToken("buttons.secondary.emphasis.onRest") }}
      />
      <MenuItemLabel>
        {t("degenMode")} <HelpIcon />
      </MenuItemLabel>
      <MenuItemDescription>{t("degenMode.warning")}</MenuItemDescription>
      <MenuItemAction>
        <ToggleRoot>
          <ToggleLabel>{t("off")}</ToggleLabel>
          <Toggle checked={false} onCheckedChange={noop} />
        </ToggleRoot>
      </MenuItemAction>
    </MenuItem>
  )
}
