import { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"

import { Notification } from "./Notification"

type Story = StoryObj<typeof Notification>

export default {
  component: Notification,
} satisfies Meta<typeof Notification>

const Template = (
  args: React.ComponentPropsWithoutRef<typeof Notification>,
) => {
  // remount on iteration change to reset progress animation
  const [i, setIteration] = useState(0)
  return (
    <Notification
      key={i}
      {...args}
      onClose={() => setIteration((i) => i + 1)}
      content="Transaction has been submitted"
      dateString="2 minutes ago"
    />
  )
}

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
