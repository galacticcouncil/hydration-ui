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
  price: number | string
  marketCap: number | string
  changeIn24h: number | string
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
    id: "2",
    token: "ETH",
    price: "$ 3012.77",
    marketCap: "$ 361.9B",
    changeIn24h: "3.21%",
  },
  {
    id: "3",
    token: "BNB",
    price: "$ 412.30",
    marketCap: "$ 64.5B",
    changeIn24h: "1.12%",
  },
  {
    id: "4",
    token: "XRP",
    price: "$ 0.75",
    marketCap: "$ 35.2B",
    changeIn24h: "-0.56%",
  },
  {
    id: "5",
    token: "SOL",
    price: "$ 102.56",
    marketCap: "$ 34.1B",
    changeIn24h: "5.01%",
  },
]

const _mockColumns_: ColumnDef<TMockData>[] = [
  {
    accessorKey: "token",
    header: "Token",
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
  },
]

const MockTable = ({
  isLoading,
  ...props
}: Partial<
  ComponentPropsWithoutRef<typeof DataTable> & { isLoading?: boolean }
>) => {
  const table = useReactTable({
    data: _mockTableData_,
    columns: _mockColumns_,
    isLoading,
    skeletonRowCount: _mockTableData_.length,
  })

  return <DataTable {...props} table={table} />
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
