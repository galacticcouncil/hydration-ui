import { Provider as TooltipProvider } from "@radix-ui/react-tooltip"
import type { Meta, StoryObj } from "@storybook/react"
import React from "react"

import { Tooltip } from "./Tooltip"

type Story = StoryObj<typeof Tooltip>

export default {
  component: Tooltip,
} satisfies Meta<typeof Tooltip>

const Template = (args: React.ComponentPropsWithoutRef<typeof Tooltip>) => (
  <TooltipProvider delayDuration={0}>
    <Tooltip {...args} />
  </TooltipProvider>
)

export const Default: Story = {
  render: (args) => (
    <Template {...args} text="Some short explanation of the feature here " />
  ),
}
