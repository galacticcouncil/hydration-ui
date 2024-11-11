import { Meta, StoryObj } from "@storybook/react"

import { Input } from "./Input"

type Story = StoryObj<typeof Input>

export default {
  component: Input,
} satisfies Meta<typeof Input>

const placeholder = "Search tokens"

const Template = (args: React.ComponentPropsWithoutRef<typeof Input>) => (
  <Input {...args} />
)

export const Default: Story = {
  render: Template,
  args: {
    placeholder,
  },
}

export const Disabled: Story = {
  render: Template,
  args: {
    placeholder,
    disabled: true,
  },
}

export const Standalone: Story = {
  render: Template,
  args: {
    placeholder,
    variant: "standalone",
  },
}

export const StandaloneDisalbed: Story = {
  render: Template,
  args: {
    placeholder,
    disabled: true,
    variant: "standalone",
  },
}

export const StandaloneSmall: Story = {
  render: Template,
  args: {
    placeholder,
    variant: "standalone",
    customSize: "small",
  },
}
