import { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"

import { Paper } from "@/components"

import { AccountInput } from "./AccountInput"

type Story = StoryObj<typeof AccountInput>

export default {
  component: AccountInput,
  title: "Components/AccountInput",
} satisfies Meta<typeof AccountInput>

const Template = (
  args: React.ComponentPropsWithoutRef<typeof AccountInput>,
) => {
  const [value, setValue] = useState(args.value || "")
  return (
    <Paper p={20} maxWidth={500}>
      <AccountInput {...args} value={value} onChange={setValue} />
    </Paper>
  )
}

export const Default: Story = {
  render: Template,
  args: {
    placeholder: "Paste address here...",
  },
}

export const WithValue: Story = {
  render: Template,
  args: {
    value: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    placeholder: "Paste address here...",
  },
}

export const WithError: Story = {
  render: Template,
  args: {
    value: "0x19912230039c10861946dF36CDe0eFeF09C3894A",
    placeholder: "Paste address here...",
    isError: true,
  },
}
