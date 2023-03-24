import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ReactComponent as FillIcon } from "assets/icons/Fill.svg"
import { ReactComponent as PauseIcon } from "assets/icons/PauseIcon.svg"
import { TableAction } from "components/Table/Table"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { useAccountStore } from "state/store"
import { theme } from "theme"
import { safeConvertAddressSS58 } from "utils/formatting"
import { OrderCapacity } from "../capacity/OrderCapacity"
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

  const { account } = useAccountStore()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    pair: true,
    price: true,
    offering: isDesktop,
    accepting: isDesktop,
    filled: isDesktop,
    actions: isDesktop,
  }

  const columns = [
    accessor("id", {
      id: "pair",
      header: "Assets",
      cell: ({ row }) => (
        <OrderPairColumn
          offering={row.original.offering}
          accepting={row.original.accepting}
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
        row.original.offering.initial && row.original.partiallyFillable ? (
          <OrderCapacity
            total={row.original.offering.initial}
            free={row.original.offering.amount}
            symbol={row.original.offering.symbol}
          />
        ) : (
          <Text fs={12} fw={400} color="basic400" tAlign={"center"} as="div">
            N / A
          </Text>
        ),
    }),
    display({
      id: "actions",
      cell: ({ row }) => {
        const userAddress = safeConvertAddressSS58(account?.address, 63)
        const orderOwner = row.original.owner
        if (orderOwner === userAddress) {
          return (
            <TableAction
              icon={<PauseIcon />}
              onClick={() => actions.onClose(row.original)}
              disabled={false}
              variant={"error"}
            >
              {t("otc.offers.table.actions.close")}
            </TableAction>
          )
        } else {
          return (
            <TableAction
              icon={<FillIcon sx={{ mr: 4 }} />}
              onClick={() => {
                console.log("fiil-clicked")
                actions.onFill(row.original)
              }}
              disabled={false}
            >
              {t("otc.offers.table.actions.fill")}
            </TableAction>
          )
        }
      },
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
