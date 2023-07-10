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
import { isAfter } from "date-fns"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"
import { shortenAccountAddress } from "utils/formatting"
import { TRecentTradesTableData } from "./data/RecentTradesTableData.utils"
import { ReactComponent as BuyIcon } from "assets/icons/BuyIcon.svg"
import { ReactComponent as SellIcon } from "assets/icons/SellIcon.svg"
import { ReactComponent as TradeIcon } from "assets/icons/TradeTypeIcon.svg"
import { DisplayValue } from "components/DisplayValue/DisplayValue"

export const useRecentTradesTable = (data: TRecentTradesTableData) => {
  const { t } = useTranslation()
  const { accessor, display } =
    createColumnHelper<TRecentTradesTableData[number]>()
  const [sorting, setSorting] = useState<SortingState>([])

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    isBuy: true,
    account: isDesktop,
    totalValue: true,
    trade: isDesktop,
    date: isDesktop,
  }

  const columns = [
    accessor("isBuy", {
      id: "type",
      header: t("stats.overview.table.trades.header.action"),
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
          {isDesktop ? (
            <Text color="white">{row.original.isBuy ? "Buy" : "Sell"}</Text>
          ) : (
            <div sx={{ flex: "row", align: "center", gap: 6 }}>
              <Icon size={18} icon={getAssetLogo(row.original.assetInSymbol)} />
              <Text>{row.original.assetInSymbol}</Text>

              <Icon
                sx={{ color: "brightBlue600" }}
                css={{
                  transform: row.original.isBuy ? "rotate(180deg)" : undefined,
                }}
                icon={<TradeIcon />}
              />

              <Icon
                size={18}
                icon={getAssetLogo(row.original.assetOutSymbol)}
              />
              <Text>{row.original.assetOutSymbol}</Text>
            </div>
          )}
        </div>
      ),
    }),
    accessor("account", {
      id: "account",
      header: t("stats.overview.table.trades.header.account"),
      sortingFn: (a, b) => a.original.account.localeCompare(b.original.account),
      cell: ({ row }) => (
        <Text tAlign={isDesktop ? "center" : "right"} color="white">
          {shortenAccountAddress(row.original.account, 10)}
        </Text>
      ),
    }),
    accessor("totalValue", {
      id: "totalValue",
      header: t("stats.overview.table.trades.header.totalValue"),
      sortingFn: (a, b) =>
        a.original.totalValue.gt(b.original.totalValue) ? 1 : -1,
      cell: ({ row }) =>
        isDesktop ? (
          <Text tAlign="center" color="white">
            <DisplayValue value={row.original.totalValue} isUSD />
          </Text>
        ) : (
          <div sx={{ flex: "column", align: "flex-end" }}>
            <Text tAlign="center" color="white" fs={14}>
              <DisplayValue value={row.original.totalValue} isUSD />
            </Text>
            <Text fs={11} color="darkBlue200">
              {t("stats.overview.table.trades.value.totalValueTime", {
                date: new Date(row.original.date),
              })}
            </Text>
          </div>
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

            <Icon
              sx={{ color: "brightBlue600" }}
              icon={<TradeIcon />}
              css={{
                transform: row.original.isBuy ? "rotate(180deg)" : undefined,
              }}
            />

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
      header: t("stats.overview.table.trades.header.timeStamp"),
      sortingFn: (a, b) => (isAfter(a.original.date, b.original.date) ? 1 : -1),
      cell: ({ row }) => (
        <Text tAlign="center" color="white">
          {t("toast.date", { value: new Date(row.original.date) })}
        </Text>
      ),
    }),
  ]

  return useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
}
