import {
  SortingState,
  VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ReactComponent as ChevronRightIcon } from "assets/icons/ChevronRight.svg"
import { ButtonTransparent } from "components/Button/Button"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"
import { shortenAccountAddress } from "utils/formatting"
import { ReactComponent as AccountIcon } from "assets/icons/StakingAccountIcon.svg"

export const useLiquidityProvidersTable = (data: any) => {
  const { t } = useTranslation()
  const { accessor, display } = createColumnHelper<any[number]>()
  const [sorting, setSorting] = useState<SortingState>([])

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    account: true,
    position: true,
    tvl: isDesktop,
    share: isDesktop,
    actions: true,
  }

  const columns = useMemo(
    () => [
      accessor("account", {
        id: "account",
        header: t("account"),
        sortingFn: (a, b) => a.original.symbol.localeCompare(b.original.symbol),
        cell: ({ row }) => (
          <div
            sx={{
              flex: "row",
              gap: 8,
              align: "center",
              justify: "start",
            }}
          >
            <Icon size={26} icon={<AccountIcon />} />
            <Text fs={[14]} color="basic300">
              {shortenAccountAddress(row.original.account)}
            </Text>
          </div>
        ),
      }),
      accessor("position", {
        id: "position",
        header: t("position"),
        sortingFn: (a, b) => (a.original.tvl.gt(b.original.tvl) ? 1 : -1),
        cell: ({ row }) => (
          <Text
            tAlign={isDesktop ? "center" : "right"}
            color="white"
            fs={[13, 16]}
          >
            {row.original.position}
          </Text>
        ),
      }),
      accessor("tvl", {
        id: "tvl",
        header: t("totalValueLocked"),
        sortingFn: (a, b) => (a.original.volume.gt(b.original.volume) ? 1 : -1),
        cell: ({ row }) => (
          <Text tAlign="center" color="white">
            <DisplayValue value={row.original.tvl} isUSD />
          </Text>
        ),
      }),
      accessor("share", {
        id: "share",
        header: t("stats.omnipool.table.header.share"),
        sortingFn: (a, b) => (a.original.pol.gt(b.original.pol) ? 1 : -1),
        cell: ({ row }) => (
          <Text tAlign="center" color="white">
            {row.original.share.toString()}
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
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDesktop],
  )

  return useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
}
