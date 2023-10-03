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
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"
import { isHydraAddress, shortenAccountAddress } from "utils/formatting"
import { TRecentTradesTableData } from "./data/RecentTradesTableData.utils"
import BuyIcon from "assets/icons/BuyIcon.svg?react"
import SellIcon from "assets/icons/SellIcon.svg?react"
import TradeIcon from "assets/icons/TradeTypeIcon.svg?react"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { useRpcProvider } from "providers/rpcProvider"
import { useSpotPrices } from "api/spotPrice"
import { useDisplayAssetStore } from "utils/displayAsset"
import { BN_1 } from "utils/constants"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { u8aToHex } from "@polkadot/util"
import { HYDRA_ADDRESS_PREFIX } from "utils/api"

export const useRecentTradesTable = (data: TRecentTradesTableData) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const displayAsset = useDisplayAssetStore()

  const { accessor, display } =
    createColumnHelper<TRecentTradesTableData[number]>()
  const [sorting, setSorting] = useState<SortingState>([])

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    isBuy: true,
    account: isDesktop,
    amountIn: true,
    trade: isDesktop,
    date: isDesktop,
  }

  const spot = useSpotPrices(
    data.map((d) => d.assetInId),
    displayAsset.stableCoinId,
    true,
  )

  const spotMap = new Map(spot.map((s) => [s.data?.tokenIn, s.data?.spotPrice]))

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
      cell: ({ row }) => {
        const address = row.original.account

        const hydraAddress = isHydraAddress(address)
          ? address
          : encodeAddress(decodeAddress(address), HYDRA_ADDRESS_PREFIX)

        return (
          <Text tAlign={isDesktop ? "center" : "right"} color="white">
            {shortenAccountAddress(hydraAddress, 10)}
          </Text>
        )
      },
    }),
    accessor("amountIn", {
      id: "amountIn",
      header: t("stats.overview.table.trades.header.tradeValue"),
      sortingFn: (a, b) => {
        const aValue = a.original.amountIn.multipliedBy(
          spotMap.get(a.original.assetInId) ?? BN_1,
        )

        const bValue = b.original.amountIn.multipliedBy(
          spotMap.get(b.original.assetInId) ?? BN_1,
        )

        return aValue.gt(bValue) ? 1 : -1
      },
      cell: ({ row }) => {
        const value = row.original.amountIn.multipliedBy(
          spotMap.get(row.original.assetInId) ?? BN_1,
        )

        return isDesktop ? (
          <Text tAlign="center" color="white">
            <DisplayValue value={value} isUSD={true} />
          </Text>
        ) : (
          <div sx={{ flex: "column", align: "flex-end" }}>
            <Text tAlign="center" color="white" fs={14}>
              <DisplayValue value={value} isUSD={true} />
            </Text>
            <Text fs={11} color="darkBlue200">
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
        return (
          <div sx={{ flex: "row", align: "center", gap: 6 }}>
            <Icon size={18} icon={<AssetLogo id={row.original.assetInId} />} />
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

            <Icon size={18} icon={<AssetLogo id={row.original.assetOutId} />} />
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
