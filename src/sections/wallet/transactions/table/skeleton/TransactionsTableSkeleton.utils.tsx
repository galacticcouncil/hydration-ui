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
    badge: isDesktop,
    source: isDesktop,
    arrow: isDesktop,
    dest: isDesktop,
    actions: isDesktop,
  }

  const columns = useMemo(
    () => [
      display({
        id: "type",
        header: t("wallet.transactions.table.header.type"),
        cell: () => (
          <Skeleton width={50} height={20} enableAnimation={enableAnimation} />
        ),
      }),
      display({
        id: "amount",
        header: t("wallet.transactions.table.header.amount"),
        cell: () => (
          <div sx={{ flex: "row", pr: 12 }}>
            <Skeleton
              width={72}
              height={20}
              enableAnimation={enableAnimation}
            />
          </div>
        ),
      }),
      display({
        id: "badge",
        cell: () => (
          <div sx={{ flex: "row" }}>
            <Skeleton
              width={100}
              height={20}
              enableAnimation={enableAnimation}
            />
          </div>
        ),
      }),
      display({
        id: "source",
        header: t("wallet.transactions.table.header.source"),
        cell: () => (
          <div sx={{ flex: "row" }}>
            <Skeleton
              width={72}
              height={20}
              enableAnimation={enableAnimation}
            />
          </div>
        ),
      }),
      display({
        id: "arrow",
        cell: () => <></>,
      }),
      display({
        id: "dest",
        header: t("wallet.transactions.table.header.destination"),
        cell: () => (
          <div sx={{ flex: "row" }}>
            <Skeleton
              width={72}
              height={20}
              enableAnimation={enableAnimation}
            />
          </div>
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

const mockData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
