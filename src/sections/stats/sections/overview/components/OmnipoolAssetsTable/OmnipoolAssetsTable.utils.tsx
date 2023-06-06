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
import { TOmnipoolAssetsTableData } from "./data/OmnipoolAssetsTableData.utils"
import { ButtonTransparent } from "components/Button/Button"
import { ReactComponent as ChevronRightIcon } from "assets/icons/ChevronRight.svg"

export const useOmnipoolAssetsTable = (data: TOmnipoolAssetsTableData) => {
  const { t } = useTranslation()
  const { accessor, display } =
    createColumnHelper<TOmnipoolAssetsTableData[number]>()
  const [sorting, setSorting] = useState<SortingState>([])

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
    accessor("symbol", {
      id: "symbol",
      header: t("stats.overview.table.assets.header.asset"),
      sortingFn: (a, b) => a.original.symbol.localeCompare(b.original.symbol),
      cell: ({ row }) => (
        <div
          sx={{
            flex: "row",
            gap: 8,
            align: "center",
            justify: ["start", "center"],
          }}
        >
          <Icon size={26} icon={getAssetLogo(row.original.symbol)} />
          <Text color="white">{row.original.symbol}</Text>
        </div>
      ),
    }),
    accessor("tvl", {
      id: "tvl",
      header: t("stats.overview.table.assets.header.tvl"),
      sortingFn: (a, b) => (a.original.tvl.gt(b.original.tvl) ? 1 : -1),
      cell: ({ row }) => (
        <Text tAlign={isDesktop ? "center" : "right"} color="white">
          {t("value.usd", { amount: row.original.tvl })}
        </Text>
      ),
    }),
    accessor("volume", {
      id: "volume",
      header: t("stats.overview.table.assets.header.volume"),
      sortingFn: (a, b) => (a.original.volume.gt(b.original.volume) ? 1 : -1),
      cell: ({ row }) => (
        <Text tAlign="center" color="white">
          {t("value.usd", { amount: row.original.volume })}
        </Text>
      ),
    }),
    /*accessor("fee", {
      id: "fee",
      header: t("stats.overview.table.assets.header.fee"),
      sortingFn: (a, b) => (a.original.fee.gt(b.original.fee) ? 1 : -1),
      cell: ({ row }) => (
        <Text tAlign="center" color="white">
          {t("value.usd", { amount: row.original.fee })}
        </Text>
      ),
    }),*/
    accessor("pol", {
      id: "pol",
      header: t("stats.overview.table.assets.header.pol"),
      sortingFn: (a, b) => (a.original.pol.gt(b.original.pol) ? 1 : -1),
      cell: ({ row }) => (
        <Text tAlign="center" color="white">
          {t("value.usd", { amount: row.original.pol })}
        </Text>
      ),
    }),
    display({
      id: "actions",
      cell: () => (
        <div>
          <ButtonTransparent css={{ color: theme.colors.iconGray }}>
            <ChevronRightIcon />
          </ButtonTransparent>
        </div>
      ),
    }),
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
