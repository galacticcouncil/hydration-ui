import { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Toggle } from "./Toggle"

type Story = StoryObj<typeof Toggle>

export default {
  component: Toggle,
} satisfies Meta<typeof Toggle>

const Template = (args: React.ComponentPropsWithoutRef<typeof Toggle>) => {
  const [value, setValue] = useState(args.checked)
  return <Toggle {...args} checked={value} onCheckedChange={setValue} />
}

export const Default: Story = {
  render: (args) => <Template {...args} />,
}

export const Large: Story = {
  render: (args) => <Template {...args} />,
  args: { size: "large" },
}

export const Active: Story = {
  render: (args) => <Template {...args} />,
  args: { checked: true },
}

export const Disabled: Story = {
  render: (args) => <Template {...args} />,
  args: { disabled: true },
}

export const DisabledActive: Story = {
  render: (args) => <Template {...args} checked />,
  args: { disabled: true },
}
