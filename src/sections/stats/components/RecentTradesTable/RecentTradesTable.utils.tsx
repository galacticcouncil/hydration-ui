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
import { isHydraAddress, shortenAccountAddress } from "utils/formatting"
import { TRecentTradesTableData } from "./data/RecentTradesTableData.utils"
import BuyIcon from "assets/icons/BuyIcon.svg?react"
import SellIcon from "assets/icons/SellIcon.svg?react"
import TradeIcon from "assets/icons/TradeTypeIcon.svg?react"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { HYDRA_ADDRESS_PREFIX } from "utils/api"
import { useRpcProvider } from "providers/rpcProvider"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"

export const useRecentTradesTable = (data: TRecentTradesTableData) => {
  const { t } = useTranslation()

  const { assets } = useRpcProvider()

  const { accessor, display } =
    createColumnHelper<TRecentTradesTableData[number]>()
  const [sorting, setSorting] = useState<SortingState>([])

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    isBuy: true,
    account: isDesktop,
    tradeValue: true,
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
              <Icon
                size={18}
                icon={<AssetLogo id={row.original.assetInId} />}
              />
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
                icon={<AssetLogo id={row.original.assetOutId} />}
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
      cell: ({ getValue }) => (
        <Text tAlign={isDesktop ? "center" : "right"} color="white">
          {shortenAccountAddress(getValue(), 10)}
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
          <Text tAlign="center" color="white">
            <DisplayValue value={getValue()} isUSD />
          </Text>
        ) : (
          <div sx={{ flex: "column", align: "flex-end" }}>
            <Text tAlign="center" color="white" fs={14}>
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
        <Text tAlign="center" color="white" css={{ whiteSpace: "nowrap" }}>
          {t("stats.overview.table.trades.value.totalValueTime", {
            date: new Date(row.original.date),
          })}
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
