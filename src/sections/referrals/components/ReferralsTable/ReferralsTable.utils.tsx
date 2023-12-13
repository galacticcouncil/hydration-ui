import {
  SortingState,
  VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "components/Button/Button"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { shortenAccountAddress } from "utils/formatting"
import { TReferralsTableData } from "./data/ReferralsTableData.utils"

export const useReferralsTable = (data: TReferralsTableData) => {
  const { t } = useTranslation()

  const { accessor, display } =
    createColumnHelper<TReferralsTableData[number]>()
  const [sorting, setSorting] = useState<SortingState>([])

  const columnVisibility: VisibilityState = {
    account: true,
    volume: true,
    rewards: true,
    tier: true,
    actions: true,
  }

  const columns = [
    accessor("account", {
      id: "account",
      header: t("referrals.table.header.account"),
      sortingFn: (a, b) => a.original.account.localeCompare(b.original.account),
      cell: ({ row }) => (
        <Text color="white">
          {row.original.isIdentity
            ? row.original.account
            : shortenAccountAddress(row.original.account, 6)}
        </Text>
      ),
    }),

    accessor("volume", {
      id: "volume",
      header: t("referrals.table.header.volume"),
      sortingFn: (a, b) => (a.original.volume.gt(b.original.volume) ? 1 : -1),
      cell: ({ getValue }) => {
        return (
          <Text color="white">
            <DisplayValue value={getValue()} isUSD />
          </Text>
        )
      },
    }),
    accessor("rewards", {
      id: "rewards",
      header: t("referrals.table.header.rewards"),
      cell: ({ getValue }) => {
        return (
          <Text color="pink600">
            {t("value.tokenWithSymbol", {
              value: getValue(),
              symbol: "HDX",
              decimalPlaces: 2,
            })}
          </Text>
        )
      },
    }),
    accessor("tier", {
      id: "tier",
      header: t("referrals.table.header.tier"),
      cell: ({ getValue }) => (
        <Text color="white" css={{ whiteSpace: "nowrap" }}>
          {getValue()}
        </Text>
      ),
    }),
    display({
      id: "actions",
      cell: () => (
        <div css={{ whiteSpace: "nowrap" }} sx={{ pr: 20 }}>
          <Button size="micro">Tip User</Button>
        </div>
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
