import type { Meta, StoryObj } from "@storybook/react"
import React from "react"

import { Chip } from "./Chip"

type Story = StoryObj<typeof Chip>

export default {
  component: Chip,
} satisfies Meta<typeof Chip>

const Template = (args: React.ComponentPropsWithoutRef<typeof Chip>) => (
  <Chip {...args}>Stablepool</Chip>
)

export const Default: Story = {
  render: Template,
}
