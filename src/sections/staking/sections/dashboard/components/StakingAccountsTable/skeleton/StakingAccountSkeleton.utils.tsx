import {
  VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"
import Skeleton from "react-loading-skeleton"

export const useStakingAccountsTableSkeleton = () => {
  const { t } = useTranslation()
  const { display } = createColumnHelper()

  const isDesktop = useMedia(theme.viewport.gte.sm)

  const columnVisibility: VisibilityState = {
    account: true,
    amount: true,
    dollarValue: isDesktop,
    link: isDesktop,
  }

  const columns = [
    display({
      id: "account",
      header: t("staking.dashboard.table.account"),
      cell: () => (
        <div
          sx={{
            flex: "row",
            gap: 8,
            align: "center",
            justify: "start",
          }}
        >
          <Skeleton circle height={26} width={26} />
          <Skeleton height={16} width={120} />
        </div>
      ),
    }),
    display({
      id: "amount",
      header: t("staking.dashboard.table.stakedAmount"),
      cell: () => <Skeleton height={16} width={70} />,
    }),
    display({
      id: "dollarValue",
      header: t("staking.dashboard.table.currentValue"),
      cell: ({ row }) => <Skeleton height={16} width={70} />,
    }),
    display({
      id: "link",
      cell: () => <div />,
    }),
  ]

  const table = useReactTable({
    data: mockData,
    columns,
    state: { columnVisibility },
    getCoreRowModel: getCoreRowModel(),
  })

  return table
}

const mockData = [1, 2, 3, 4, 5]
