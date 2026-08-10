import { Provider as TooltipProvider } from "@radix-ui/react-tooltip"
import type { Meta, StoryObj } from "@storybook/react-vite"
import React from "react"

import { Tooltip } from "./Tooltip"

type Story = StoryObj<typeof Tooltip>

const LIPSUM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."

export default {
  component: Tooltip,
} satisfies Meta<typeof Tooltip>

const Template = (args: React.ComponentPropsWithoutRef<typeof Tooltip>) => (
  <TooltipProvider delayDuration={0}>
    <Tooltip {...args} />
  </TooltipProvider>
)

export const Default: Story = {
  render: (args) => <Template {...args} text={LIPSUM} />,
}

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "2rem", padding: "4rem" }}>
      <Template {...args} size="small" text={LIPSUM} />
      <Template {...args} size="medium" text={LIPSUM} />
      <Template {...args} size="large" text={LIPSUM} />
    </div>
  ),
}
