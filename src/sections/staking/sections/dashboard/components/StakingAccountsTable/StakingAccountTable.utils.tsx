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
import { useMemo, useState } from "react"
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
    actionPoints: BN(2000),
  },
  {
    account: "7NPoMQbiA6trJKkjB32kk96MeJD4PGWkLQLH7k7hXEkZpipo",
    actionPoints: BN(900),
  },
  {
    account: "7NPoMQbiA6trJKkjB32kk96MeJD4PGWkLQLHhXEkZ2jd",
    actionPoints: BN(9100),
  },
  {
    account: "7NPoMQbiA6trJKkjB32kk96MeJD4PGWkLQLH7k7hXEk3oPo",
    actionPoints: BN(9200),
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

  const columns = useMemo(
    () => [
      accessor("account", {
        id: "account",
        header: t("staking.dashboard.table.account"),
        sortingFn: (a, b) =>
          a.original.account.localeCompare(b.original.account),
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
      accessor("actionPoints", {
        id: "actionPoints",
        header: t("staking.dashboard.table.actionPoints"),
        sortingFn: (a, b) =>
          a.original.actionPoints.gt(b.original.actionPoints) ? 1 : -1,
        cell: ({ row }) => (
          <Text tAlign="right" color="white">
            {t("value.usd", { amount: row.original.actionPoints })}
          </Text>
        ),
      }),
      display({
        id: "link",
        cell: () => (
          <ButtonTransparent>
            <Icon size={12} sx={{ color: "darkBlue300" }} icon={<LinkIcon />} />
          </ButtonTransparent>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return useReactTable({
    data: dummyData,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
}
