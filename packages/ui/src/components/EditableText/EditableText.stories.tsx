import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Box } from "@/components"

import { EditableText } from "./EditableText"

type Story = StoryObj<typeof EditableText>

export default {
  component: EditableText,
} satisfies Meta<typeof EditableText>

const Template = (
  args: React.ComponentPropsWithoutRef<typeof EditableText>,
) => {
  const [value, setValue] = useState(args.value)
  return (
    <Box maxWidth="5xl">
      <EditableText {...args} value={value} onChange={setValue} />
    </Box>
  )
}

export const Default: Story = {
  render: Template,
  args: {
    value: "",
    placeholder: "Add a name...",
    font: "secondary",
    fw: 500,
    fs: 16,
  },
}

export const WithValue: Story = {
  render: Template,
  args: {
    value: "Treasury multisig",
    placeholder: "Add a name...",
    font: "secondary",
    fw: 500,
    fs: 16,
  },
}

export const Disabled: Story = {
  render: Template,
  args: {
    value: "Treasury multisig",
    placeholder: "Add a name...",
    disabled: true,
    font: "secondary",
    fw: 500,
    fs: 16,
  },
}

export const PrimaryFont: Story = {
  render: Template,
  args: {
    value: "Operations wallet",
    placeholder: "Add a name...",
    font: "primary",
    fw: 600,
    fs: "h4",
  },
}

export const LongText: Story = {
  render: Template,
  args: {
    value:
      "Very long multisig account label that should truncate when it exceeds the container width",
    placeholder: "Add a name...",
    font: "secondary",
    fw: 500,
    fs: 16,
  },
}
