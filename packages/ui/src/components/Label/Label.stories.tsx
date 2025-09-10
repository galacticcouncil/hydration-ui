import type { Meta, StoryObj } from "@storybook/react"
import { useId } from "react"

import { Box, Checkbox, Input } from "@/components"

import { Label } from "./Label"

type Story = StoryObj<typeof Label>

export default {
  component: Label,
} satisfies Meta<typeof Label>

export const Default: Story = {
  render: (args) => {
    const id = useId()
    return (
      <Box maxWidth={400}>
        <Label {...args} htmlFor={id}>
          E-mail
        </Label>
        <Input id={id} placeholder="Type your e-mail..." />
      </Box>
    )
  },
}

export const Customized: Story = {
  render: (args) => {
    const id = useId()
    return (
      <Box maxWidth={400}>
        <Label {...args} htmlFor={id}>
          E-mail
        </Label>
        <Input id={id} placeholder="Type your e-mail..." />
      </Box>
    )
  },
  args: {
    fw: 600,
    fs: 16,
    color: "red",
  },
}

export const AsWrapper: Story = {
  render: (args) => (
    <Box maxWidth={400}>
      <Label {...args} sx={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Checkbox />
        <span>I accept the terms and conditions</span>
      </Label>
    </Box>
  ),
}
