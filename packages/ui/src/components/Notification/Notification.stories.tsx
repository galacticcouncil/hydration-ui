import { Meta, StoryObj } from "@storybook/react"

import { Notification } from "./Notification"

type Story = StoryObj<typeof Notification>

export default {
  component: Notification,
} satisfies Meta<typeof Notification>

const Template = (
  args: React.ComponentPropsWithoutRef<typeof Notification>,
) => <Notification {...args} />

export const Success: Story = {
  render: Template,
  args: {
    content: "Transaction has been submitted",
    variant: "success",
  },
}

export const Error: Story = {
  render: Template,
  args: { content: "Transaction has been submitted", variant: "error" },
}

export const Warning: Story = {
  render: Template,
  args: { content: "Transaction has been submitted", variant: "warning" },
}

export const Submitted: Story = {
  render: Template,
  args: { content: "Transaction has been submitted", variant: "submitted" },
}

export const Unknown: Story = {
  render: Template,
  args: { content: "Transaction has been submitted", variant: "unknown" },
}
