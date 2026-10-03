import type { Meta, StoryObj } from "@storybook/react-vite"
import { createColumnHelper } from "@tanstack/react-table"

import { Amount, AssetLogo, Button, Flex, Text } from "@/components"
import { getToken } from "@/utils"

import { CardTable } from "./CardTable"

type Story = StoryObj<typeof CardTable>

export default {
  component: CardTable,
} satisfies Meta<typeof CardTable>

type TData = {
  symbol: string
  logo: string
  tvl: number
  apy: number
  capacity: number
}

const DATA: TData[] = [
  {
    symbol: "BTC",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
    tvl: 1_240_000,
    apy: 0.0412,
    capacity: 0.62,
  },
  {
    symbol: "ETH",
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
    tvl: 830_500,
    apy: 0.0587,
    capacity: 0.18,
  },
]

const usd = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "USD",
  notation: "compact",
})
const percent = new Intl.NumberFormat("en", {
  style: "percent",
  minimumFractionDigits: 2,
})

const columnHelper = createColumnHelper<TData>()

const assetColumn = columnHelper.accessor("symbol", {
  header: "Asset",
  cell: ({ row }) => (
    <Flex align="center" gap="s">
      <AssetLogo src={row.original.logo} size="small" />
      <Text fs="p4" fw={500} color={getToken("text.high")}>
        {row.original.symbol}
      </Text>
    </Flex>
  ),
})

const statColumns = [
  columnHelper.accessor("tvl", {
    header: "TVL",
    cell: ({ getValue }) => (
      <Amount value={usd.format(getValue())} displayValue="Total locked" />
    ),
  }),
  columnHelper.accessor("apy", {
    header: "Net APY",
    cell: ({ getValue }) => (
      <Text fs="p4" fw={600} color={getToken("accents.success.emphasis")}>
        {percent.format(getValue())}
      </Text>
    ),
  }),
  columnHelper.accessor("capacity", {
    header: "Remaining capacity",
    cell: ({ getValue }) => (
      <Text fs="p4" fw={500} color={getToken("text.high")}>
        {percent.format(getValue())}
      </Text>
    ),
  }),
]

const actionsColumn = columnHelper.display({
  id: "actions",
  cell: () => (
    <Flex justify="flex-end" gap="base">
      <Button size="small" variant="secondary">
        Deposit
      </Button>
    </Flex>
  ),
})

const columns = [assetColumn, ...statColumns, actionsColumn]

export const Default: Story = {
  render: () => <CardTable data={DATA} columns={columns} />,
}

export const Loading: Story = {
  render: () => <CardTable data={DATA} columns={columns} isLoading />,
}

export const WithoutActions: Story = {
  render: () => (
    <CardTable data={DATA} columns={[assetColumn, ...statColumns]} />
  ),
}
