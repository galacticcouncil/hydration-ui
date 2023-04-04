import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"
import { OrderCapacity } from "../capacity/OrderCapacity"
import { OtcOrderActions } from "./actions/OtcOrderActions"
import {
  OrderAssetColumn,
  OrderPairColumn,
  OrderPriceColumn,
} from "./OtcOrdersData"
import { OrderTableData } from "./OtcOrdersData.utils"

export const useOrdersTable = (
  data: OrderTableData[],
  actions: {
    onFill: (data: OrderTableData) => void
    onClose: (data: OrderTableData) => void
  },
) => {
  const { t } = useTranslation()
  const { accessor, display } = createColumnHelper<OrderTableData>()

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    pair: true,
    price: true,
    offering: isDesktop,
    accepting: isDesktop,
    filled: isDesktop,
    actions: true,
  }

  const columns = [
    accessor("id", {
      id: "pair",
      header: "Assets",
      cell: ({ row }) => (
        <OrderPairColumn
          offering={row.original.offering}
          accepting={row.original.accepting}
          pol={row.original.pol}
        />
      ),
    }),
    accessor("price", {
      id: "price",
      header: t("otc.offers.table.header.price"),
      cell: ({ row }) => (
        <OrderPriceColumn
          symbol={row.original.accepting.symbol}
          price={row.original.price}
        />
      ),
    }),
    accessor("offering", {
      id: "offering",
      header: isDesktop
        ? t("otc.offers.table.header.offering")
        : t("selectAssets.asset"),
      cell: ({ row }) => <OrderAssetColumn pair={row.original.offering} />,
    }),
    accessor("accepting", {
      id: "accepting",
      header: t("otc.offers.table.header.accepting"),
      cell: ({ row }) => <OrderAssetColumn pair={row.original.accepting} />,
    }),
    accessor("filled", {
      id: "filled",
      header: () => (
        <div
          style={{
            textAlign: "center",
            width: "100%",
          }}
        >
          {t("otc.offers.table.header.status")}
        </div>
      ),
      cell: ({ row }) =>
        row.original.accepting.initial && row.original.partiallyFillable ? (
          <div
            style={{
              textAlign: "center",
              margin: "0 -20px",
            }}
          >
            <OrderCapacity
              total={row.original.accepting.initial}
              free={row.original.accepting.amount}
              symbol={row.original.accepting.symbol}
            />
          </div>
        ) : (
          <Text fs={12} fw={400} color="basic400" tAlign={"center"} as="div">
            N / A
          </Text>
        ),
    }),
    display({
      id: "actions",
      cell: ({ row }) => (
        <OtcOrderActions
          data={row.original}
          onClose={actions.onClose}
          onFill={actions.onFill}
        />
      ),
    }),
  ]

  const table = useReactTable({
    data,
    columns,
    state: { columnVisibility },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return table
}
