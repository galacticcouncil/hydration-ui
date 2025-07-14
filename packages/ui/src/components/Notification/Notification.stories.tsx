import { Meta, StoryObj } from "@storybook/react"

import { Notification } from "./Notification"

type Story = StoryObj<typeof Notification>

export default {
  component: Notification,
} satisfies Meta<typeof Notification>

const Template = (
  args: React.ComponentPropsWithoutRef<typeof Notification>,
) => (
  <Notification
    {...args}
    onClose={() => {}}
    content="Transaction has been submitted"
    dateString="2 minutes ago"
  />
)

export const Success: Story = {
  render: Template,
  args: { variant: "success" },
}

export const Pending: Story = {
  render: Template,
  args: { variant: "pending" },
}

export const Error: Story = {
  render: Template,
  args: { variant: "error" },
}

export const Warning: Story = {
  render: Template,
  args: { variant: "warning" },
}

export const Submitted: Story = {
  render: Template,
  args: { variant: "submitted" },
}

export const Unknown: Story = {
  render: Template,
  args: { variant: "unknown" },
}
