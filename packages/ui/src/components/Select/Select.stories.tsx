import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import {
  Bitcoin,
  Droplets,
  Flower,
  Gem,
  Hexagon,
  Mountain,
  Orbit,
  Sun,
  Triangle,
  Waves,
} from "@/assets/icons"
import { Flex, Logo } from "@/components"

import { Select, SelectItem } from "./Select"

type Story = StoryObj<typeof Select>

export default {
  component: Select,
} satisfies Meta<typeof Select>

const itemsWithIcons: ReadonlyArray<SelectItem<string>> = [
  { key: "hydration", label: "Hydration", icon: Droplets },
  { key: "bitcoin", label: "Bitcoin", icon: Bitcoin },
  { key: "ethereum", label: "Ethereum", icon: Gem },
  { key: "solana", label: "Solana", icon: Sun },
  { key: "bnb", label: "BNB Chain", icon: Hexagon },
  { key: "xrpl", label: "XRP Ledger", icon: Waves },
  { key: "tron", label: "Tron", icon: Triangle },
  { key: "cardano", label: "Cardano", icon: Flower },
  { key: "avalanche", label: "Avalanche", icon: Mountain },
  { key: "polkadot", label: "Polkadot", icon: Orbit },
]

const items: ReadonlyArray<SelectItem<string>> = itemsWithIcons.map(
  ({ key, label }) => ({ key, label }),
)

// label and CoinMarketCap id, which names the logo file
const coins: ReadonlyArray<SelectItem<string>> = (
  [
    ["Bitcoin", 1],
    ["Ethereum", 1027],
    ["Tether", 825],
    ["XRP", 52],
    ["BNB", 1839],
    ["Solana", 5426],
    ["USD Coin", 3408],
    ["Dogecoin", 74],
    ["Cardano", 2010],
    ["TRON", 1958],
    ["Chainlink", 1975],
    ["Avalanche", 5805],
    ["Stellar", 512],
    ["Sui", 20947],
    ["Hedera", 4642],
    ["Bitcoin Cash", 1831],
    ["Litecoin", 2],
    ["Toncoin", 11419],
    ["Polkadot", 6636],
    ["Shiba Inu", 5994],
    ["Uniswap", 7083],
    ["Monero", 328],
    ["Aave", 7278],
    ["NEAR Protocol", 6535],
    ["Internet Computer", 8916],
    ["Ethereum Classic", 1321],
    ["Aptos", 21794],
    ["Cosmos", 3794],
    ["Arbitrum", 11841],
    ["Filecoin", 2280],
  ] as const
).map(([label, id]) => ({
  key: label,
  label,
  icon: () => (
    <Logo
      style={{ width: "100%", height: "100%" }}
      src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${id}.png`}
    />
  ),
}))

type TemplateProps = Pick<
  React.ComponentProps<typeof Select>,
  | "variant"
  | "size"
  | "outline"
  | "label"
  | "placeholder"
  | "disabled"
  | "fullWidth"
> & { items?: ReadonlyArray<SelectItem<string>> }

const Single = (props: TemplateProps) => {
  const [value, setValue] = useState<string>()

  return (
    <Select
      placeholder="Select chain"
      items={items}
      {...props}
      value={value}
      onValueChange={setValue}
    />
  )
}

const Multiple = (props: TemplateProps) => {
  const [value, setValue] = useState<ReadonlyArray<string>>([])

  return (
    <Select
      multiple
      placeholder="All"
      items={items}
      {...props}
      value={value}
      onValueChange={setValue}
    />
  )
}

export const Default: Story = {
  render: () => <Single />,
}

export const WithLabel: Story = {
  render: () => <Single label="Chain" />,
}

/** Stays open while picking; the trigger lists every picked label. */
export const MultipleSelection: Story = {
  render: () => <Multiple label="Chains" />,
}

export const WithIcons: Story = {
  render: () => (
    <Flex align="center" gap="m">
      <Single items={itemsWithIcons} />
      <Multiple items={itemsWithIcons} />
    </Flex>
  ),
}

export const ManyItems: Story = {
  render: () => (
    <Flex align="center" gap="m">
      <Single placeholder="Select coin" items={coins} />
      <Multiple items={coins} />
    </Flex>
  ),
}

/** The trigger fills its container and the menu is at least as wide. */
export const FullWidth: Story = {
  render: () => (
    <Flex direction="column" gap="m" width="5xl">
      <Single fullWidth label="Chain" />
      <Multiple fullWidth items={itemsWithIcons} />
    </Flex>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Flex align="center" gap="m">
      {(["micro", "small", "medium", "large"] as const).map((size) => (
        <Single key={size} size={size} />
      ))}
    </Flex>
  ),
}

/** Every Button variant works; the bottom row turns the default outline off. */
export const Variants: Story = {
  render: () => (
    <Flex align="center" gap="m" wrap>
      {(
        [
          "muted",
          "primary",
          "secondary",
          "tertiary",
          "transparent",
          "ghost",
        ] as const
      ).map((variant) => (
        <Flex key={variant} direction="column" gap="s">
          <Single variant={variant} />
          <Single variant={variant} outline={false} />
        </Flex>
      ))}
    </Flex>
  ),
}

export const Disabled: Story = {
  render: () => <Single disabled />,
}
