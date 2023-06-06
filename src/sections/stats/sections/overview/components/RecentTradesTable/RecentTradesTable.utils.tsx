import {
  SortingState,
  VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"

import { TRecentTradesTableData } from "./data/RecentTradesTableData.utils"
import { shortenAccountAddress } from "utils/formatting"
//import { ReactComponent as LinkIcon } from "assets/icons/LinkIcon.svg"
import { ReactComponent as SellIcon } from "assets/icons/SellIcon.svg"
import { ReactComponent as BuyIcon } from "assets/icons/BuyIcon.svg"
import { ReactComponent as TradeIcon } from "assets/icons/TradeTypeIcon.svg"
import { isAfter } from "date-fns"

export const useRecentTradesTable = (data: TRecentTradesTableData) => {
  const { t } = useTranslation()
  const { accessor, display } =
    createColumnHelper<TRecentTradesTableData[number]>()
  const [sorting, setSorting] = useState<SortingState>([])

  /*
    type
    account (without sort)
    tvl
    amount (display)
    timestamp
    subscan (without sort)
  */

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    symbol: true,
    tvl: true,
    volume: isDesktop,
    fee: isDesktop,
    pol: isDesktop,
    actions: true,
  }

  const columns = [
    accessor("isBuy", {
      id: "type",
      header: "Action",
      sortingFn: (a, b) => (a.original.isBuy === b.original.isBuy ? 1 : -1),
      cell: ({ row }) => (
        <div
          sx={{
            flex: "row",
            gap: 8,
            align: "center",
            justify: ["start", "center"],
          }}
        >
          <Icon
            sx={{ color: "darkBlue300" }}
            icon={row.original.isBuy ? <BuyIcon /> : <SellIcon />}
          />
          <Text color="white">{row.original.isBuy ? "Buy" : "Sell"}</Text>
        </div>
      ),
    }),
    accessor("account", {
      id: "account",
      header: "Account",
      sortingFn: (a, b) => a.original.account.localeCompare(b.original.account),
      cell: ({ row }) => (
        <Text tAlign={isDesktop ? "center" : "right"} color="white">
          {shortenAccountAddress(row.original.account, 10)}
        </Text>
      ),
    }),
    accessor("totalValue", {
      id: "totalValue",
      header: " Total Value",
      sortingFn: (a, b) =>
        a.original.totalValue.gt(b.original.totalValue) ? 1 : -1,
      cell: ({ row }) => (
        <Text tAlign="center" color="white">
          {t("value.usd", { amount: row.original.totalValue })}
        </Text>
      ),
    }),
    display({
      id: "trade",
      cell: ({ row }) => {
        return (
          <div sx={{ flex: "row", align: "center", gap: 6 }}>
            <Icon size={18} icon={getAssetLogo(row.original.assetInSymbol)} />
            <Text>
              {t("value.tokenWithSymbol", {
                value: row.original.amountIn,
                symbol: row.original.assetInSymbol,
              })}
            </Text>

            <Icon sx={{ color: "brightBlue600" }} icon={<TradeIcon />} />

            <Icon size={18} icon={getAssetLogo(row.original.assetOutSymbol)} />
            <Text>
              {t("value.tokenWithSymbol", {
                value: row.original.amountOut,
                symbol: row.original.assetOutSymbol,
              })}
            </Text>
          </div>
        )
      },
    }),
    accessor("date", {
      id: "date",
      header: "Time Stamp",
      sortingFn: (a, b) => (isAfter(a.original.date, b.original.date) ? 1 : -1),
      cell: ({ row }) => (
        <Text tAlign="center" color="white">
          {t("toast.date", { value: new Date(row.original.date) })}
        </Text>
      ),
    }),
    /* display({
      id: "pol",
      header: "Subscan",
      cell: () => (
        <Icon size={12} sx={{ color: "darkBlue300" }} icon={<LinkIcon />} />
      ),
    }),*/
  ]

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return table
}
