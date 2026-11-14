import {
  EllipsisVerticalIcon,
  Trash2Icon,
} from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  MenuItem,
  MenuItemIcon,
  MenuItemLabel,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type BankAccountMenuProps = {
  isRemoving: boolean
  onRemove: () => void
}

/**
 * A saved account's row action (overflow menu): Remove. The DELETE goes out
 * once per press; the row stays until the re-read list drops it (API doc 4).
 */
export const BankAccountMenu: FC<BankAccountMenuProps> = ({
  isRemoving,
  onRemove,
}) => {
  const { t } = useTranslation(["onramp"])
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="tertiary"
          size="small"
          iconStart={EllipsisVerticalIcon}
          aria-label={t("bank.accounts.actions")}
          disabled={isRemoving}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={isRemoving} onSelect={onRemove}>
          <MenuItem>
            <MenuItemIcon component={Trash2Icon} />
            <MenuItemLabel>{t("bank.accounts.remove")}</MenuItemLabel>
          </MenuItem>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
