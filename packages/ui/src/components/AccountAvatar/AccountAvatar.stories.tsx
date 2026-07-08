import { Meta, StoryObj } from "@storybook/react-vite"

import { AccountAvatar } from "./AccountAvatar"

type Story = StoryObj<typeof AccountAvatar>

export default {
  component: AccountAvatar,
} satisfies Meta<typeof AccountAvatar>

export const Identican: Story = {
  render: (args) => <AccountAvatar {...args} />,
  args: {
    address: "0x19912230039c10861946dF36CDe0eFeF09C3894A",
    size: 100,
  },
}
