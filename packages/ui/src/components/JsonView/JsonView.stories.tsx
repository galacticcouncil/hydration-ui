import type { Meta, StoryObj } from "@storybook/react"

import { Paper } from "@/components/Paper"

import { JsonView } from "./JsonView"

type Story = StoryObj<typeof JsonView>

export default {
  component: JsonView,
} satisfies Meta<typeof JsonView>

const EXAMPLE_JSON = {
  string:
    "lorem ipsum dolor sit amet, consectetur adipiscing elit. sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  number: 123456,
  boolean: false,
  null: null,
  array: ["string", 123456, false, null],
  object: {
    k1: 123,
    k2: "123",
    k3: false,
  },
}

const Template = (args: Story["args"]) => {
  return (
    <Paper p={20}>
      <JsonView src={EXAMPLE_JSON} {...args} />
    </Paper>
  )
}

export const Default: Story = {
  render: Template,
}

export const CustomFontSize: Story = {
  render: Template,
  args: {
    fs: [10, null, 20],
  },
}
