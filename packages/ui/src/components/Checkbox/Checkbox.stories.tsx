import { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Checkbox } from "./Checkbox"

type Story = StoryObj<typeof Checkbox>

export default {
  component: Checkbox,
} satisfies Meta<typeof Checkbox>

const Template = (args: React.ComponentPropsWithoutRef<typeof Checkbox>) => {
  const [value, setValue] = useState(args.checked)
  return (
    <Checkbox
      {...args}
      checked={value}
      onCheckedChange={setValue}
      name="checkbox"
    />
  )
}

export const Default: Story = {
  render: (args) => <Template {...args} />,
}

export const Small: Story = {
  render: (args) => <Template {...args} size="small" />,
}

export const Large: Story = {
  render: (args) => <Template {...args} size="large" />,
}

export const Disabled: Story = {
  render: (args) => <Template {...args} disabled />,
}

export const DisabledActive: Story = {
  render: (args) => <Template {...args} checked disabled />,
}
