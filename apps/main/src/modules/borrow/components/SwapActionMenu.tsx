import { Ellipsis } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  ButtonProps,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  MenuItemLabel,
  MenuSelectionItem,
} from "@galacticcouncil/ui/components"
import { FC } from "react"

type Props = {
  label: string
  onSelect: () => void
  disabled?: boolean
  size?: ButtonProps["size"]
}

export const SwapActionMenu: FC<Props> = ({
  label,
  onSelect,
  disabled,
  size = "small",
}) => (
  <DropdownMenu modal={false}>
    <DropdownMenuTrigger asChild>
      <Button
        variant="tertiary"
        outline
        size={size}
        sx={{ px: "base", flexShrink: 0 }}
        disabled={disabled}
        onClick={(e) => e.stopPropagation()}
      >
        <Icon component={Ellipsis} size="m" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem asChild>
        <MenuSelectionItem
          variant="filterLink"
          onClick={(e) => {
            // ponytail: portal events still bubble to the clickable table row
            e.stopPropagation()
            onSelect()
          }}
        >
          <MenuItemLabel>{label}</MenuItemLabel>
        </MenuSelectionItem>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)
