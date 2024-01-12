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
import { useMemo } from "react"

export const useTransactionsTableSkeleton = (enableAnimation = true) => {
  const { t } = useTranslation()
  const { display } = createColumnHelper()

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    type: true,
    amount: true,
    from: isDesktop,
    to: isDesktop,
    date: isDesktop,
    actions: isDesktop,
  }

  const columns = useMemo(
    () => [
      display({
        id: "type",
        header: t("wallet.transactions.table.header.type"),
        cell: () => (
          <Skeleton width={35} height={26} enableAnimation={enableAnimation} />
        ),
      }),
      display({
        id: "amount",
        header: t("wallet.transactions.table.header.amount"),
        cell: () => (
          <div sx={{ flex: "row" }}>
            <Skeleton
              width={72}
              height={26}
              enableAnimation={enableAnimation}
            />
          </div>
        ),
      }),
      display({
        id: "from",
        header: t("wallet.transactions.table.header.source"),
        cell: () => (
          <div sx={{ flex: "row" }}>
            <Skeleton
              width={72}
              height={26}
              enableAnimation={enableAnimation}
            />
          </div>
        ),
      }),
      display({
        id: "to",
        header: t("wallet.transactions.table.header.destination"),
        cell: () => (
          <div sx={{ flex: "row" }}>
            <Skeleton
              width={72}
              height={26}
              enableAnimation={enableAnimation}
            />
          </div>
        ),
      }),
      display({
        id: "date",
        header: t("wallet.transactions.table.header.date"),
        cell: () => (
          <Skeleton width={72} height={26} enableAnimation={enableAnimation} />
        ),
      }),
      display({
        id: "actions",
        cell: () => <></>,
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enableAnimation, isDesktop],
  )

  return useReactTable({
    data: mockData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { columnVisibility },
  })
}

const mockData = [1, 2, 3, 4, 5]
