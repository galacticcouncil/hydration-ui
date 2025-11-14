import type { Meta, StoryObj } from "@storybook/react"
import React from "react"

import { Select } from "./Select"

type Story = StoryObj<typeof Select>

const items = [
  { key: "0", label: "hydra" },
  { key: "1", label: "polkadot" },
  { key: "2", label: "moonbeam" },
  { key: "3", label: "astar" },
]

export default {
  component: Select,
} satisfies Meta<typeof Select>

const Template = (
  args: Omit<React.ComponentPropsWithoutRef<typeof Select>, "renderTrigger">,
) => <Select {...args} items={items} />

export const Default: Story = {
  render: (args) => (
    <Template placeholder="Select chain" label="Chain:" {...args} />
  ),
}
