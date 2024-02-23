import type { Meta, StoryObj } from "@storybook/react"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "components/Button/Button"
import { DataValue } from "components/DataValue"
import { useReactTable } from "hooks/useReactTable"
import { ComponentPropsWithoutRef } from "react"
import { DataTable } from "./DataTable"

type Story = StoryObj<typeof DataTable>

export default {
  component: DataTable,
} as Meta<typeof DataTable>

type TMockData = {
  id: string
  token: string
  price: string
  marketCap: string
  changeIn24h: string
}

const _mockTableData_: TMockData[] = [
  {
    id: "1",
    token: "BTC",
    price: "$ 43122.45",
    marketCap: "$ 818.2B",
    changeIn24h: "-2.34%",
  },
  {
    id: "1027",
    token: "ETH",
    price: "$ 3012.77",
    marketCap: "$ 361.9B",
    changeIn24h: "3.21%",
  },
  {
    id: "1839",
    token: "BNB",
    price: "$ 412.30",
    marketCap: "$ 64.5B",
    changeIn24h: "1.12%",
  },
  {
    id: "52",
    token: "XRP",
    price: "$ 0.75",
    marketCap: "$ 35.2B",
    changeIn24h: "-0.56%",
  },
  {
    id: "5426",
    token: "SOL",
    price: "$ 102.56",
    marketCap: "$ 34.1B",
    changeIn24h: "5.01%",
  },
  {
    id: "6753",
    token: "HDX",
    price: "$ 0.0259",
    marketCap: "$ 118.58M",
    changeIn24h: "13.41%",
  },
]

const _mockColumns_: ColumnDef<TMockData>[] = [
  {
    accessorKey: "token",
    header: "Token",
    cell: ({ row }) => {
      return (
        <span sx={{ flex: "row", align: "center", gap: 8 }}>
          <img
            width={24}
            height={24}
            alt=""
            src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${row.original.id}.png`}
            css={{ borderRadius: "50%" }}
          />
          <span>{row.original.token}</span>
        </span>
      )
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    meta: {
      sx: {
        textAlign: "center",
      },
    },
  },
  {
    accessorKey: "marketCap",
    header: "MKT Cap",
    meta: {
      sx: {
        textAlign: "center",
      },
    },
  },
  {
    accessorKey: "changeIn24h",
    header: "24H",
    meta: {
      sx: {
        textAlign: "right",
      },
    },
    cell: ({ row }) => {
      const value = row.original.changeIn24h
      return (
        <span sx={{ color: value.includes("-") ? "red400" : "green400" }}>
          {value}
        </span>
      )
    },
  },
  {
    id: "actions",
    header: "",
    meta: {
      sx: {
        textAlign: "end",
      },
    },
    cell: () => (
      <div sx={{ flex: "row", gap: 10 }}>
        <Button onClick={() => alert("SWAP")} size="micro">
          SWAP
        </Button>
        <Button onClick={() => alert("TRANSFER")} size="micro">
          TRANSFER
        </Button>
      </div>
    ),
  },
]

const MockTable = ({
  isLoading,
  ...props
}: Partial<
  ComponentPropsWithoutRef<typeof DataTable> & { isLoading?: boolean }
>) => {
  const table = useReactTable({
    data: props.emptyFallback ? [] : _mockTableData_,
    columns: _mockColumns_,
    isLoading,
    skeletonRowCount: _mockTableData_.length,
  })

  return (
    <div sx={{ p: 15 }}>
      <DataTable {...props} table={table} />
    </div>
  )
}

export const Default: Story = {
  render: MockTable,
}

export const Hoverable: Story = {
  render: MockTable,
  args: {
    hoverable: true,
  },
}

export const Striped: Story = {
  render: MockTable,
  args: {
    striped: true,
  },
}

export const Borderless: Story = {
  render: MockTable,
  args: {
    borderless: true,
  },
}

export const Small: Story = {
  render: MockTable,
  args: {
    size: "small",
    spacing: "small",
  },
}

export const Medium: Story = {
  render: MockTable,
  args: {
    size: "medium",
    spacing: "medium",
  },
}

export const Large: Story = {
  render: MockTable,
  args: {
    size: "large",
    spacing: "large",
  },
}

export const TransparentBg: Story = {
  render: MockTable,
  args: {
    background: "transparent",
  },
}

export const Skeleton: Story = {
  render: (props) => <MockTable isLoading {...props} />,
  args: {
    size: "large",
    spacing: "large",
  },
}

export const EmptyFallback: Story = {
  render: (props) => <MockTable {...props} />,
  args: {
    title: "Cryptocurrencies",
    spacing: "large",
    size: "large",
    emptyFallback: <p sx={{ color: "basic300" }}>No cryptocurrencies found.</p>,
  },
}

export const CustomRow: Story = {
  render: (props) => <MockTable {...props} />,
  args: {
    title: "Cryptocurrencies",
    renderRow: (row) => (
      <div
        sx={{ color: "white", mx: 20, mb: 20, pt: 20 }}
        css={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}
      >
        <div sx={{ mb: 10, fontSize: 20 }}>{row.original.token}</div>
        <div sx={{ flex: "row", gap: 40 }}>
          <DataValue labelColor="basic400" label="Price">
            <p sx={{ color: "basic300" }}>{row.original.price}</p>
          </DataValue>
          <DataValue labelColor="basic400" label="Market Cap">
            <p sx={{ color: "basic300" }}>{row.original.marketCap}</p>
          </DataValue>
        </div>
      </div>
    ),
  },
}

export const KitchenSink: Story = {
  render: MockTable,
  args: {
    title: "Cryptocurrencies",
    spacing: "large",
    size: "large",
    striped: true,
    hoverable: true,
    action: <Button size="micro">Download CSV</Button>,
    onRowClick: (row) => alert(JSON.stringify(row)),
    addons: (
      <DataValue labelColor="brightBlue300" label="Total Market Cap">
        $169 292 199 123
      </DataValue>
    ),
  },
}
