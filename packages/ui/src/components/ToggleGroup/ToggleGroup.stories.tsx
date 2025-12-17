import type { Meta, StoryObj } from "@storybook/react"
import {
  BellIcon,
  BookmarkIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  ThumbsUpIcon,
} from "lucide-react"
import { useState } from "react"

import {
  ToggleGroup,
  ToggleGroupItem,
  ToggleGroupRootProps,
} from "./ToggleGroup"

type Story = StoryObj<typeof ToggleGroup>

export default {
  component: ToggleGroup,
} satisfies Meta<typeof ToggleGroup>

const SingleSelectTemplate = (
  args: Omit<
    ToggleGroupRootProps<string>,
    "type" | "value" | "onValueChange" | "defaultValue"
  >,
) => {
  const [value, setValue] = useState<string>("option1")
  return (
    <ToggleGroup type="single" value={value} onValueChange={setValue} {...args}>
      <ToggleGroupItem value="option1">
        <SunIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="option2">
        <MoonIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="option3">
        <MonitorIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

const MultipleSelectTemplate = (
  args: Omit<
    ToggleGroupRootProps<string>,
    "type" | "value" | "onValueChange" | "defaultValue"
  >,
) => {
  const [value, setValue] = useState<string[]>([])
  return (
    <ToggleGroup
      type="multiple"
      value={value}
      onValueChange={setValue}
      {...args}
    >
      <ToggleGroupItem value="option1">
        <ThumbsUpIcon /> Like
      </ToggleGroupItem>
      <ToggleGroupItem value="option2">
        <BellIcon /> Subscribe
      </ToggleGroupItem>
      <ToggleGroupItem value="option3">
        <BookmarkIcon /> Bookmark
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

export const Default: Story = {
  render: SingleSelectTemplate,
}

export const Multiple: Story = {
  render: MultipleSelectTemplate,
}

export const Disabled: Story = {
  render: SingleSelectTemplate,
  args: {
    disabled: true,
  },
}
