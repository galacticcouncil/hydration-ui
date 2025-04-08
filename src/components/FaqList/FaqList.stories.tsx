import type { Meta, StoryObj } from "@storybook/react"
import { FaqList } from "./FaqList"

type Story = StoryObj<typeof FaqList>

export default {
  component: FaqList,
} as Meta<typeof FaqList>

const FAQ_ITEM = {
  question: "Lorem ipsum dolor sit amet?",
  answer:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
}

export const Default: Story = {
  render: (args) => <FaqList {...args} />,
  args: {
    items: [FAQ_ITEM, FAQ_ITEM, FAQ_ITEM, FAQ_ITEM, FAQ_ITEM],
  },
}
