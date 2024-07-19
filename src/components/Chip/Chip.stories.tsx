import type { Meta, StoryObj } from "@storybook/react"
import { Chip } from "./Chip"

type Story = StoryObj<typeof Chip>

export default {
  component: Chip,
} as Meta<typeof Chip>

const Template = (
  props: Partial<React.ComponentPropsWithoutRef<typeof Chip>>,
) => <Chip {...props}>Chip Component</Chip>

export const Default: Story = {
  render: Template,
}

export const Clickable: Story = {
  render: Template,
  args: {
    onClick: () => alert("Clicked"),
  },
}

export const Active: Story = {
  render: Template,
  args: {
    active: true,
  },
}

export const Disabled: Story = {
  render: Template,
  args: {
    disabled: true,
  },
}
