import type { Meta, StoryObj } from "@storybook/react"

import { Flex } from "@/components"

import { Button } from "./Button"

type Story = StoryObj<typeof Button>

export default {
  component: Button,
} satisfies Meta<typeof Button>

const Template = (args: Story["args"]) => <Button {...args}>Button</Button>

const VariantTemplate = (args: Story["args"]) => (
  <Flex direction="column" gap={20}>
    <Flex align="center" gap={20}>
      <Button {...args} size="large">
        Button
      </Button>
      <Button {...args} size="medium">
        Button
      </Button>
      <Button {...args} size="small">
        Button
      </Button>
    </Flex>
    <Flex align="center" gap={20}>
      <Button {...args} outline size="large">
        Button
      </Button>
      <Button {...args} outline size="medium">
        Button
      </Button>
      <Button {...args} outline size="small">
        Button
      </Button>
    </Flex>
  </Flex>
)

export const Default: Story = {
  render: Template,
}

export const Disabled: Story = {
  render: Template,
  args: {
    disabled: true,
  },
}

export const Primary: Story = {
  render: VariantTemplate,
  args: {
    variant: "primary",
  },
}

export const Secondary: Story = {
  render: VariantTemplate,
  args: {
    variant: "secondary",
  },
}

export const Tertiary: Story = {
  render: VariantTemplate,
  args: {
    variant: "tertiary",
  },
}

export const Danger: Story = {
  render: VariantTemplate,
  args: {
    variant: "danger",
  },
}

export const Emphasis: Story = {
  render: VariantTemplate,
  args: {
    variant: "emphasis",
  },
}

export const Accent: Story = {
  render: VariantTemplate,
  args: {
    variant: "accent",
  },
}

export const Muted: Story = {
  render: VariantTemplate,
  args: {
    variant: "muted",
  },
}

export const Transparent: Story = {
  render: VariantTemplate,
  args: {
    variant: "transparent",
  },
}
