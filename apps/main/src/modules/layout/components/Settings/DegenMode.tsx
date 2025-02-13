import { HelpIcon, Rectangle7101 } from "@galacticcouncil/ui/assets/icons"
import {
  SMenuItem,
  SMenuItemAction,
  SMenuItemDescription,
  SMenuItemIcon,
  SMenuItemLabel,
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
    <SMenuItem>
      <SMenuItemIcon
        component={Rectangle7101}
        sx={{ color: getToken("buttons.secondary.emphasis.onRest") }}
      />
      <SMenuItemLabel>
        {t("degenMode")} <HelpIcon />
      </SMenuItemLabel>
      <SMenuItemDescription>{t("degenMode.warning")}</SMenuItemDescription>
      <SMenuItemAction>
        <ToggleRoot>
          <ToggleLabel>{t("off")}</ToggleLabel>
          <Toggle checked={false} onCheckedChange={noop} />
        </ToggleRoot>
      </SMenuItemAction>
    </SMenuItem>
  )
}
