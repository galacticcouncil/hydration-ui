import { Meta, StoryFn } from "@storybook/react"
import { SettingsIcon } from "lucide-react"

import { IconPlaceholder } from "@/assets/icons"
import {
  MenuItem,
  MenuItemDescription,
  MenuItemIcon,
  MenuItemLabel,
  MenuSelectionItem,
  MenuSelectionItemArrow,
} from "@/components/Menu"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./DropdownMenu.styled"

export default {
  title: "components/DropdownMenu",
} satisfies Meta

export const DropdownMenuStory: StoryFn = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <SettingsIcon size="l" />
      </DropdownMenuTrigger>
      <DropdownMenuContent fullWidth>
        <DropdownMenuItem asChild>
          <MenuSelectionItem>
            <MenuItemIcon component={IconPlaceholder} />
            <MenuItemLabel>Item 1</MenuItemLabel>
            <MenuSelectionItemArrow />
          </MenuSelectionItem>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <MenuItem>
            <MenuItemIcon component={IconPlaceholder} />
            <MenuItemLabel>Item 2</MenuItemLabel>
            <MenuItemDescription>Description</MenuItemDescription>
          </MenuItem>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <MenuItem>
            <MenuItemLabel>Item 3</MenuItemLabel>
          </MenuItem>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
