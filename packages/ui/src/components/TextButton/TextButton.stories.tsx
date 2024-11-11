import { Meta, StoryObj } from "@storybook/react"
import React from "react"

import { TextButton } from "./TextButton"

type Story = StoryObj<typeof TextButton>

export default {
  component: TextButton,
} satisfies Meta<typeof TextButton>

const Template = (args: React.ComponentPropsWithoutRef<typeof TextButton>) => (
  <TextButton {...args}>More info</TextButton>
)

export const Default: Story = {
  render: Template,
}

export const Underline: Story = {
  render: Template,
  args: {
    variant: "underline",
  },
}
