import { useState } from "@storybook/preview-api"
import type { Meta, StoryObj } from "@storybook/react"
import { createColumnHelper } from "@tanstack/react-table"

import { AssetLogo } from "@/components/AssetLogo"
import { Box } from "@/components/Box"
import { Button } from "@/components/Button"
import { Flex } from "@/components/Flex"
import { Input } from "@/components/Input"
import { Paper } from "@/components/Paper"
import { TableContainer } from "@/components/Table"
import {
  MCapFormatter,
  PercFormatter,
  PriceFormatter,
  TABLE_DATA,
} from "@/components/Table/Table.stories"
import { Text } from "@/components/Text"

import { DataTable } from "./DataTable"

type Story = StoryObj<typeof DataTable>

export default {
  component: DataTable,
} as Meta<typeof DataTable>

type TData = (typeof TABLE_DATA)[number]

const columnHelper = createColumnHelper<TData>()

const TABLE_COLUMNS = [
  columnHelper.accessor("symbol", {
    enableSorting: false,
    header: "Symbol",
    cell: ({ row, getValue }) => {
      return (
        <Flex align="center" gap={8}>
          <AssetLogo
            assetId={row.original.id}
            src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${row.original.id}.png`}
          />
          <Text fw={600}>{getValue()}</Text>
        </Flex>
      )
    },
  }),
  columnHelper.accessor("price", {
    header: "Price",
    cell: ({ getValue }) => PriceFormatter.format(getValue()),
    meta: {
      sx: {
        textAlign: "end",
      },
    },
  }),
  columnHelper.accessor("marketCap", {
    header: "Market Cap",
    cell: ({ getValue }) => MCapFormatter.format(getValue()),
    meta: {
      visibility: ["tablet", "desktop"],
      sx: {
        textAlign: ["end", "end", "end", "center"],
      },
    },
  }),
  columnHelper.accessor("changeIn24h", {
    header: "24h %",
    meta: {
      visibility: ["desktop"],
      sx: {
        textAlign: "end",
      },
    },
    cell: ({ getValue }) => {
      return (
        <Text color={getValue() > 0 ? "successGreen.500" : "utility.red.500"}>
          {PercFormatter.format(getValue())}
        </Text>
      )
    },
  }),
  columnHelper.display({
    id: "actions",
    meta: {
      visibility: ["desktop"],
      sx: {
        textAlign: "end",
      },
    },
    cell: () => (
      <Flex gap={8} inline>
        <Button size="small" onClick={() => alert("SWAP")}>
          Swap
        </Button>
        <Button
          size="small"
          variant="secondary"
          onClick={() => alert("TRANSFER")}
        >
          Transfer
        </Button>
      </Flex>
    ),
  }),
]

const MockTable = (args: Story["args"]) => {
  const [search, setSearch] = useState(args?.globalFilter)
  return (
    <TableContainer as={Paper}>
      {typeof args?.globalFilter === "string" && (
        <Box p={10}>
          <Input
            variant="standalone"
            customSize="small"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Box>
      )}
      <DataTable
        {...args}
        globalFilter={search}
        data={(args?.data as TData[]) || TABLE_DATA}
        columns={TABLE_COLUMNS}
      />
    </TableContainer>
  )
}

export const Default: Story = {
  render: MockTable,
}

export const WithSkeletons: Story = {
  render: MockTable,
  args: {
    fixedLayout: true,
    isLoading: true,
    skeletonRowCount: TABLE_DATA.length,
  },
}

export const WithSearch: Story = {
  render: MockTable,
  args: {
    fixedLayout: true,
    globalFilter: "btc",
  },
}

export const WithPagination: Story = {
  render: MockTable,
  args: {
    fixedLayout: true,
    paginated: true,
    pageSize: 10,
    data: Array.from({ length: 1000 }, (_, index) => ({
      id: `${index + 1}`,
      symbol: `Coin ${index + 1}`,
      price: Math.random() * 100,
      marketCap: Math.random() * 1000000,
      changeIn24h: Math.random() * 10 - 5,
    })),
  },
}
