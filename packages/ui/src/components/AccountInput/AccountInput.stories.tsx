import { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { BookOpen } from "@/assets/icons"
import { ButtonIcon, Icon, Paper, Tooltip } from "@/components"

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
    <Paper p="xl" maxWidth={500}>
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

export const WithContacts: Story = {
  render: Template,
  args: {
    placeholder: "Paste address here...",
    endAdornment: (
      <Tooltip
        text="My Contacts"
        size="small"
        delayDuration={0}
        side="bottom"
        alignOffset={0}
        asChild
      >
        <ButtonIcon aria-label="My Contacts">
          <Icon component={BookOpen} size="m" />
        </ButtonIcon>
      </Tooltip>
    ),
  },
}
