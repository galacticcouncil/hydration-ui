import {
  SortingState,
  VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"

import BN from "bignumber.js"
import { ButtonTransparent } from "components/Button/Button"
import { ReactComponent as StakingAccountIcon } from "assets/icons/StakingAccountIcon.svg"
import { ReactComponent as LinkIcon } from "assets/icons/LinkIcon.svg"
import { shortenAccountAddress } from "utils/formatting"

const dummyData = [
  {
    account: "7NPoMQbiA6trJKkjB35uk96MeJD4PGWkLQLH7k7hXEkZpiba",
    amount: BN(1000000),
    dollarValue: BN(2000),
  },
  {
    account: "7NPoMQbiA6trJKkjB32kk96MeJD4PGWkLQLH7k7hXEkZpipo",
    amount: BN(2300000),
    dollarValue: BN(900),
  },
  {
    account: "7NPoMQbiA6trJKkjB32kk96MeJD4PGWkLQLHhXEkZ2jd",
    amount: BN(20000),
    dollarValue: BN(9100),
  },
  {
    account: "7NPoMQbiA6trJKkjB32kk96MeJD4PGWkLQLH7k7hXEk3oPo",
    amount: BN(2340000),
    dollarValue: BN(9200),
  },
]

//TODO: connect data
export const useStakingAccountsTable = () => {
  const { t } = useTranslation()
  const { accessor, display } = createColumnHelper<(typeof dummyData)[number]>()
  const [sorting, setSorting] = useState<SortingState>([])

  const isDesktop = useMedia(theme.viewport.gte.sm)

  const columnVisibility: VisibilityState = {
    account: true,
    amount: true,
    dollarValue: isDesktop,
    link: isDesktop,
  }

  const columns = [
    accessor("account", {
      id: "account",
      header: t("staking.dashboard.table.account"),
      sortingFn: (a, b) => a.original.account.localeCompare(b.original.account),
      cell: ({ row }) => (
        <div
          sx={{
            flex: "row",
            gap: 8,
            align: "center",
            justify: "start",
          }}
        >
          <Icon size={26} icon={<StakingAccountIcon />} />
          <Text fs={[14]} color="basic300">
            {shortenAccountAddress(row.original.account)}
          </Text>
        </div>
      ),
    }),
    accessor("amount", {
      id: "amount",
      header: t("staking.dashboard.table.stakedAmount"),
      sortingFn: (a, b) => (a.original.amount.gt(b.original.amount) ? 1 : -1),
      cell: ({ row }) => (
        <Text
          tAlign={isDesktop ? "center" : "right"}
          color="white"
          fs={[13, 16]}
        >
          {t("value.usd", { amount: row.original.amount })}
        </Text>
      ),
    }),
    accessor("dollarValue", {
      id: "dollarValue",
      header: t("staking.dashboard.table.currentValue"),
      sortingFn: (a, b) =>
        a.original.dollarValue.gt(b.original.dollarValue) ? 1 : -1,
      cell: ({ row }) => (
        <Text tAlign="center" color="white">
          {t("value.usd", { amount: row.original.dollarValue })}
        </Text>
      ),
    }),
    display({
      id: "link",
      cell: () => (
        <ButtonTransparent>
          <Icon size={18} sx={{ color: "darkBlue300" }} icon={<LinkIcon />} />
        </ButtonTransparent>
      ),
    }),
  ]

  const table = useReactTable({
    data: dummyData,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return table
}
