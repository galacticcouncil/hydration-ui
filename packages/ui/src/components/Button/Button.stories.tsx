import type { Meta, StoryObj } from "@storybook/react"
import React from "react"

import { Button } from "./Button"

type Story = StoryObj<typeof Button>

export default {
  component: Button,
} satisfies Meta<typeof Button>

const Template = (args: React.ComponentPropsWithoutRef<typeof Button>) => (
  <Button {...args}>Button</Button>
)

export const Default: Story = {
  render: Template,
}

export const VariantPrimary: Story = {
  render: Template,
  args: {
    variant: "primary",
  },
}

export const VariantSecondary: Story = {
  render: Template,
  args: {
    variant: "secondary",
  },
}

export const TertiarySecondary: Story = {
  render: Template,
  args: {
    variant: "tertiary",
  },
}

export const SizeSmall: Story = {
  render: Template,
  args: {
    size: "small",
  },
}

export const SizeMedium: Story = {
  render: Template,
  args: {
    size: "medium",
  },
}

export const SizeLarge: Story = {
  render: Template,
  args: {
    size: "large",
  },
}

/* export const Outline: Story = {
  render: Template,
  args: {
    outline: true,
  },
}
 */
