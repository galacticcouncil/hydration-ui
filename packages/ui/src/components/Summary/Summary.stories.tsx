import type { Meta, StoryObj } from "@storybook/react"

import { Toggle } from "@/components"

import { Summary } from "./Summary"

type Story = StoryObj<typeof Summary>

export default {
  component: Summary,
} satisfies Meta<typeof Summary>

export const Default: Story = {
  render: Summary,
  args: {
    rows: [
      {
        label: "Transaction cost",
        content: "$1.00",
      },
      {
        label: "Transaction expiration",
        content: "13/05/2025 17:42:54",
      },
      {
        label: "Nonce",
        content: "124",
      },
      {
        label: "Tip block author",
        content: <Toggle checked onCheckedChange={() => {}} />,
      },
    ],
  },
}
