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

type TTableData = {
  id: string
  symbol: string
  price: number
  marketCap: number
  changeIn24h: number
}

export const PriceFormatter = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "USD",
})

export const MCapFormatter = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "USD",
  notation: "compact",
})

export const PercFormatter = new Intl.NumberFormat("en", {
  style: "percent",
  minimumFractionDigits: 2,
  signDisplay: "exceptZero",
})

export const TABLE_DATA: TTableData[] = [
  {
    id: "1",
    symbol: "BTC",
    price: 102381.92,
    marketCap: 1_836_894_875_779,
    changeIn24h: -0.0234,
  },
  {
    id: "1027",
    symbol: "ETH",
    price: 3012.77,
    marketCap: 392_141_215_229,
    changeIn24h: 0.0321,
  },
  {
    id: "1839",
    symbol: "BNB",
    price: 687.27,
    marketCap: 100_330_387_639,
    changeIn24h: 0.0112,
  },
  {
    id: "52",
    symbol: "XRP",
    price: 2.3,
    marketCap: 132_226_504_847,
    changeIn24h: -0.0056,
  },
  {
    id: "5426",
    symbol: "SOL",
    price: 188.27,
    marketCap: 90_964_630_797,
    changeIn24h: 0.0501,
  },
  {
    id: "6753",
    symbol: "HDX",
    price: 0.01005,
    marketCap: 37_540_643,
    changeIn24h: 0.0134,
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
            <TableCell>{PriceFormatter.format(price)}</TableCell>
            <TableCell>{MCapFormatter.format(marketCap)}</TableCell>
            <TableCell>
              <Text
                color={changeIn24h > 0 ? "successGreen.500" : "utility.red.500"}
              >
                {PercFormatter.format(changeIn24h)}
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
