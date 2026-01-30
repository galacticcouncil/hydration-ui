import type { Meta, StoryObj } from "@storybook/react-vite"

import { ValueStats } from "./ValueStats"

type Story = StoryObj<typeof ValueStats>

export default {
  component: ValueStats,
} satisfies Meta<typeof ValueStats>

const Template = (args: Story["args"]) => (
  <ValueStats label="Net worth" value="$1 000 000" {...args} />
)

export const Small: Story = {
  render: Template,
  args: {
    size: "small",
  },
}

export const Medium: Story = {
  render: Template,
  args: {
    size: "medium",
  },
}

export const Large: Story = {
  render: Template,
  args: {
    size: "large",
  },
}

export const BottomLabel: Story = {
  render: Template,
  args: {
    bottomLabel: "$100 in borrows",
  },
}

export const SecondaryFont: Story = {
  render: Template,
  args: {
    size: "small",
    font: "secondary",
  },
}
