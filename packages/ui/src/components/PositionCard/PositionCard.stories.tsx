import type { Meta, StoryObj } from "@storybook/react-vite"
import { ComponentPropsWithoutRef } from "react"

import { AssetLogo, Button, Flex, Stack, Text, ValueStats } from "@/components"

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

const stat = (label: string, value: string) => (
  <ValueStats
    wrap
    size="small"
    font="secondary"
    label={label}
    customValue={
      <Text fs="p3" fw={500} lh={1}>
        {value}
      </Text>
    }
  />
)

/** Cards in a list: the stats sit in the same place on every card, whatever the name and action widths. */
export const Stacked: Story = {
  render: () => (
    <Stack gap="m">
      {[
        { symbol: "4 000 PRIME", pnl: "+84.2 PRIME (+7.22%)", cta: ["Add"] },
        { symbol: "300 PRIME", pnl: "0 PRIME (0%)", cta: ["Add"] },
        {
          symbol: "12 345 678 PRIME",
          pnl: "-60 PRIME (-6%)",
          cta: ["Resume", "Add", "Withdraw"],
        },
      ].map(({ symbol, pnl, cta }) => (
        <PositionCard
          key={symbol}
          logo={
            <AssetLogo src="https://s2.coinmarketcap.com/static/img/coins/64x64/1.png" />
          }
          symbol={symbol}
          stats={
            <>
              {stat("PnL", pnl)}
              {stat("Net APY", "12.42%")}
            </>
          }
          cta={
            <Flex gap="xs">
              {cta.map((label) => (
                <Button key={label} size="small" variant="secondary">
                  {label}
                </Button>
              ))}
            </Flex>
          }
        />
      ))}
    </Stack>
  ),
}
