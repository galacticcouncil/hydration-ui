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
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { useAccountStore } from "state/store"
import { theme } from "theme"
import { safeConvertAddressSS58 } from "utils/formatting"
import { OrderCapacity } from "./capacity/OrderCapacity"
import { OrderAssetColumn, OrderPriceColumn } from "./OtcOrdersData"
import { OffersTableData } from "./OtcOrdersData.utils"

export const useOffersTable = (
  data: OffersTableData[],
  actions: {
    onFill: (data: OffersTableData) => void
    onClose: (data: OffersTableData) => void
  },
) => {
  const { t } = useTranslation()
  const { accessor, display } = createColumnHelper<OffersTableData>()

  const { account } = useAccountStore()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    offering: true,
    accepting: true,
    price: true,
    filled: isDesktop,
    actions: true,
  }

  const columns = [
    accessor("offering", {
      id: "offering",
      header: isDesktop
        ? t("otc.offers.table.header.offering")
        : t("selectAssets.asset"),
      cell: ({ row }) => <OrderAssetColumn pair={row.original.offering} />,
    }),
    accessor("accepting", {
      id: "transferable",
      header: t("otc.offers.table.header.accepting"),
      cell: ({ row }) => <OrderAssetColumn pair={row.original.accepting} />,
    }),
    accessor("price", {
      id: "price",
      header: t("otc.offers.table.header.price"),
      cell: ({ row }) => (
        <OrderPriceColumn
          assetIn={row.original.offering.symbol}
          assetOut={row.original.accepting.symbol}
          price={row.original.price}
        />
      ),
    }),
    accessor("filled", {
      id: "filled",
      header: t("otc.offers.table.header.filled"),
      cell: ({ row }) => <OrderCapacity filled={25} />,
    }),
    display({
      id: "actions",
      cell: ({ row }) => {
        const userAddress = safeConvertAddressSS58(account?.address, 63)
        const orderOwner = row.original.owner
        if (orderOwner === userAddress) {
          return (
            <TableAction
              icon={<PauseIcon sx={{ mr: 10 }} />}
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
              icon={<FillIcon sx={{ mr: 10 }} />}
              onClick={() => actions.onFill(row.original)}
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
