import type { Meta, StoryObj } from "@storybook/react-vite"
import { ComponentPropsWithoutRef } from "react"

import { AssetLogo, Button, Text, ValueStats } from "@/components"

import { PositionCard } from "./PositionCard"

type Story = StoryObj<typeof PositionCard>

export default {
  component: PositionCard,
} satisfies Meta<typeof PositionCard>

const Template = (args: ComponentPropsWithoutRef<typeof PositionCard>) => (
  <PositionCard {...args} />
)

export const Default: Story = {
  render: Template,
  args: {
    logo: (
      <AssetLogo
        src={`https://s2.coinmarketcap.com/static/img/coins/64x64/1.png`}
      />
    ),
    symbol: "BTC",
    stats: (
      <>
        <ValueStats
          wrap
          size="small"
          font="secondary"
          label="Price"
          customValue={
            <Text fs="p3" fw={500} lh={1}>
              $97,842
            </Text>
          }
          bottomLabel="+2.41% (24h)"
        />
        <ValueStats
          wrap
          size="small"
          font="secondary"
          label="Market cap"
          customValue={
            <Text fs="p3" fw={500} lh={1}>
              $1.93T
            </Text>
          }
          bottomLabel="Rank #1"
        />
        <ValueStats
          wrap
          size="small"
          font="secondary"
          label="Max supply"
          customValue={
            <Text fs="p3" fw={500} lh={1}>
              21,000,000 BTC
            </Text>
          }
          bottomLabel="~94.2% mined"
        />
      </>
    ),
    cta: <Button size="small">Buy</Button>,
  },
}
