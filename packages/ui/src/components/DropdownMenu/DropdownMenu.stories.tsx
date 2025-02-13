import { Meta, StoryFn } from "@storybook/react"
import { SettingsIcon } from "lucide-react"

import { Rectangle7101 } from "@/assets/icons"
import {
  SMenuItem,
  SMenuItemDescription,
  SMenuItemIcon,
  SMenuItemLabel,
  SMenuSelectionItem,
  SMenuSelectionItemArrow,
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
        <SettingsIcon size={21} />
      </DropdownMenuTrigger>
      <DropdownMenuContent fullWidth>
        <DropdownMenuItem asChild>
          <SMenuSelectionItem>
            <SMenuItemIcon component={Rectangle7101} />
            <SMenuItemLabel>Item 1</SMenuItemLabel>
            <SMenuSelectionItemArrow />
          </SMenuSelectionItem>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <SMenuItem>
            <SMenuItemIcon component={Rectangle7101} />
            <SMenuItemLabel>Item 2</SMenuItemLabel>
            <SMenuItemDescription>Description</SMenuItemDescription>
          </SMenuItem>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <SMenuItem>
            <SMenuItemLabel>Item 3</SMenuItemLabel>
          </SMenuItem>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
