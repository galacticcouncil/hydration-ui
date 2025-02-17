import { Meta, StoryFn } from "@storybook/react"
import { SettingsIcon } from "lucide-react"

import { Rectangle7101 } from "@/assets/icons"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemArrow,
  DropdownMenuItemDescription,
  DropdownMenuItemIcon,
  DropdownMenuItemLabel,
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
        <DropdownMenuItem>
          <DropdownMenuItemIcon component={Rectangle7101} />
          <DropdownMenuItemLabel>Item 1</DropdownMenuItemLabel>
          <DropdownMenuItemArrow />
        </DropdownMenuItem>
        <DropdownMenuItem>
          <DropdownMenuItemIcon component={Rectangle7101} />
          <DropdownMenuItemLabel>Item 2</DropdownMenuItemLabel>
          <DropdownMenuItemDescription>Description</DropdownMenuItemDescription>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <DropdownMenuItemLabel>Item 3</DropdownMenuItemLabel>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
