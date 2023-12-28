import {
  SortingState,
  VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { isAfter } from "date-fns"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"
import {
  getChainSpecificAddress,
  shortenAccountAddress,
} from "utils/formatting"
import { TRecentTradesTableData } from "./data/RecentTradesTableData.utils"
import TradeIcon from "assets/icons/TradeTypeIcon.svg?react"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { useRpcProvider } from "providers/rpcProvider"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import LinkIcon from "assets/icons/LinkIcon.svg?react"

export const useRecentTradesTable = (data: TRecentTradesTableData) => {
  const { t } = useTranslation()

  const { assets } = useRpcProvider()

  const { accessor, display } =
    createColumnHelper<TRecentTradesTableData[number]>()
  const [sorting, setSorting] = useState<SortingState>([])

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    account: isDesktop,
    tradeValue: true,
    trade: true,
    date: isDesktop,
    actions: isDesktop,
  }

  const columnOrder = isDesktop
    ? ["account", "tradeValue", "trade", "date", "actions"]
    : ["trade", "tradeValue"]

  const columns = [
    accessor("account", {
      id: "account",
      header: t("stats.overview.table.trades.header.account"),
      sortingFn: (a, b) => a.original.account.localeCompare(b.original.account),
      cell: ({ row }) => (
        <Text color="white">
          {row.original.isIdentity
            ? row.original.account
            : shortenAccountAddress(
                getChainSpecificAddress(row.original.account),
                6,
              )}
        </Text>
      ),
    }),

    accessor("tradeValue", {
      id: "tradeValue",
      header: isDesktop
        ? t("stats.overview.table.trades.header.tradeValue")
        : t("stats.overview.table.trades.header.tradeValueTime"),
      sortingFn: (a, b) =>
        a.original.tradeValue.gt(b.original.tradeValue) ? 1 : -1,
      cell: ({ row, getValue }) => {
        return isDesktop ? (
          <Text color="white">
            <DisplayValue value={getValue()} isUSD />
          </Text>
        ) : (
          <div sx={{ flex: "column", align: "flex-end", pr: 16 }}>
            <Text color="white" fs={14}>
              <DisplayValue value={getValue()} isUSD />
            </Text>
            <Text
              fs={11}
              color="darkBlue200"
              tAlign="right"
              css={{ whiteSpace: "nowrap" }}
            >
              {t("stats.overview.table.trades.value.totalValueTime", {
                date: new Date(row.original.date),
              })}
            </Text>
          </div>
        )
      },
    }),
    display({
      id: "trade",
      header: isDesktop ? "" : "asset",
      cell: ({ row }) => {
        const metaIn = assets.getAsset(row.original.assetInId)
        const iconInIds = assets.isStableSwap(metaIn)
          ? metaIn.assets
          : metaIn.id

        const metaOut = assets.getAsset(row.original.assetOutId)
        const iconOutIds = assets.isStableSwap(metaOut)
          ? metaOut.assets
          : metaOut.id

        return (
          <div sx={{ flex: "row", align: "center", gap: 6 }}>
            {isDesktop && (
              <Text fs={[14, 16]}>
                {t("value.tokenWithSymbol", {
                  value: row.original.amountIn,
                  symbol: row.original.assetInSymbol,
                })}
              </Text>
            )}
            {typeof iconInIds === "string" ? (
              <Icon size={18} icon={<AssetLogo id={iconInIds} />} />
            ) : (
              <MultipleIcons
                size={18}
                icons={iconInIds.map((id) => ({
                  icon: <AssetLogo id={id} />,
                }))}
              />
            )}

            <Icon sx={{ color: "brightBlue600" }} icon={<TradeIcon />} />

            {isDesktop && (
              <Text fs={[14, 16]}>
                {t("value.tokenWithSymbol", {
                  value: row.original.amountOut,
                  symbol: row.original.assetOutSymbol,
                })}
              </Text>
            )}

            {typeof iconOutIds === "string" ? (
              <Icon size={18} icon={<AssetLogo id={iconOutIds} />} />
            ) : (
              <MultipleIcons
                size={18}
                icons={iconOutIds.map((id) => ({
                  icon: <AssetLogo id={id} />,
                }))}
              />
            )}
          </div>
        )
      },
    }),
    accessor("date", {
      id: "date",
      header: t("stats.overview.table.trades.header.timeStamp"),
      sortingFn: (a, b) => (isAfter(a.original.date, b.original.date) ? 1 : -1),
      cell: ({ row }) => (
        <Text color="white" css={{ whiteSpace: "nowrap" }}>
          {t("stats.overview.table.trades.value.totalValueTime", {
            date: new Date(row.original.date),
          })}
        </Text>
      ),
    }),
    display({
      id: "actions",
      cell: ({ row }) => (
        <div sx={{ pl: [5, 0] }}>
          <a
            href={`https://hydradx.subscan.io/extrinsic/${row.original.extrinsicHash}`}
            target="blank"
            rel="noreferrer"
          >
            <Icon size={12} sx={{ color: "darkBlue300" }} icon={<LinkIcon />} />
          </a>
        </div>
      ),
    }),
  ]

  return useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, columnOrder },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
}
