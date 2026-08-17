import type { Meta, StoryObj } from "@storybook/react-vite"
import { CandlestickChart, LineChart } from "lucide-react"
import React from "react"

import { Flex, Icon, ToggleGroup, ToggleGroupItem } from "@/components"

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

export const Sizes: Story = {
  render: (args) => (
    <Flex align="center" gap="m">
      {(["small", "medium", "large"] as const).map((size) => (
        <Flex key={size} align="center" gap="s">
          <Template placeholder="Select chain" size={size} {...args} />
          <ToggleGroup type="single" size={size} defaultValue="a">
            <ToggleGroupItem value="a">
              <Icon component={CandlestickChart} size="s" />
            </ToggleGroupItem>
            <ToggleGroupItem value="b">
              <Icon component={LineChart} size="s" />
            </ToggleGroupItem>
          </ToggleGroup>
        </Flex>
      ))}
    </Flex>
  ),
}
