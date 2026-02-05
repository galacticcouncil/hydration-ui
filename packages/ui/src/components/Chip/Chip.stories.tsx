import type { Meta, StoryObj } from "@storybook/react-vite"
import React from "react"

import { Flex } from "@/components"

import { Chip } from "./Chip"

type Story = StoryObj<typeof Chip>

export default {
  component: Chip,
} satisfies Meta<typeof Chip>

const Template = (args: React.ComponentPropsWithoutRef<typeof Chip>) => (
  <Flex gap="xl" align="center">
    <Chip {...args} size="large">
      Voted
    </Chip>
    <Chip {...args} size="medium">
      Voted
    </Chip>
    <Chip {...args} size="small">
      Voted
    </Chip>
  </Flex>
)

export const Default: Story = {
  render: Template,
}

export const Primary: Story = {
  render: Template,
  args: {
    variant: "primary",
  },
}

export const Rounded: Story = {
  render: Template,
  args: {
    variant: "primary",
    rounded: true,
  },
}

export const Secondary: Story = {
  render: Template,
  args: {
    variant: "secondary",
  },
}

export const Tertiary: Story = {
  render: Template,
  args: {
    variant: "tertiary",
  },
}

export const Info: Story = {
  render: Template,
  args: {
    variant: "info",
  },
}

export const Success: Story = {
  render: Template,
  args: {
    variant: "success",
  },
}

export const Warning: Story = {
  render: Template,
  args: {
    variant: "warning",
  },
}

export const Danger: Story = {
  render: Template,
  args: {
    variant: "danger",
  },
}
