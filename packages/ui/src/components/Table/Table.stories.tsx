import type { Meta, StoryObj } from "@storybook/react"

import { AssetLogo } from "@/components/AssetLogo"
import { Flex } from "@/components/Flex"
import { Paper } from "@/components/Paper"
import { Text } from "@/components/Text"

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table"

type Story = StoryObj<typeof Table>

export default {
  component: Table,
} satisfies Meta<typeof Table>

const TABLE_DATA = [
  {
    id: "1",
    symbol: "BTC",
    price: "$43 122.45",
    marketCap: "$818.2B",
    changeIn24h: "-2.34%",
  },
  {
    id: "1027",
    symbol: "ETH",
    price: "$3 012.77",
    marketCap: "$361.9B",
    changeIn24h: "3.21%",
  },
  {
    id: "1839",
    symbol: "BNB",
    price: "$412.30",
    marketCap: "$64.5B",
    changeIn24h: "1.12%",
  },
  {
    id: "52",
    symbol: "XRP",
    price: "$0.75",
    marketCap: "$35.2B",
    changeIn24h: "-0.56%",
  },
  {
    id: "5426",
    symbol: "SOL",
    price: "$102.56",
    marketCap: "$34.1B",
    changeIn24h: "5.01%",
  },
  {
    id: "6753",
    symbol: "HDX",
    price: "$0.0259",
    marketCap: "$118.58M",
    changeIn24h: "13.41%",
  },
]

const Template = (args: Story["args"]) => (
  <TableContainer as={Paper}>
    <Table {...args}>
      <TableHeader>
        <TableHead>Symbol</TableHead>
        <TableHead canSort>Price</TableHead>
        <TableHead canSort>Market Cap</TableHead>
        <TableHead canSort>24h %</TableHead>
      </TableHeader>
      <TableBody>
        {TABLE_DATA.map(({ id, symbol, price, marketCap, changeIn24h }) => (
          <TableRow key={id}>
            <TableCell>
              <Flex align="center" gap={8}>
                <AssetLogo
                  assetId={id}
                  src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${id}.png`}
                />
                <Text fw={600}>{symbol}</Text>
              </Flex>
            </TableCell>
            <TableCell>{price}</TableCell>
            <TableCell>{marketCap}</TableCell>
            <TableCell>
              <Text
                color={
                  parseFloat(changeIn24h) > 0
                    ? "successGreen.500"
                    : "utility.red.500"
                }
              >
                {changeIn24h}
              </Text>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

export const Default: Story = {
  render: Template,
  args: {
    size: "large",
  },
}

export const SmallSize: Story = {
  render: Template,
  args: {
    size: "small",
  },
}

export const MediumSize: Story = {
  render: Template,
  args: {
    size: "medium",
  },
}

export const LargeSize: Story = {
  render: Template,
  args: {
    size: "large",
  },
}

export const Hoverable: Story = {
  render: Template,
  args: {
    hoverable: true,
  },
}

export const Borderless: Story = {
  render: Template,
  args: {
    borderless: true,
  },
}
