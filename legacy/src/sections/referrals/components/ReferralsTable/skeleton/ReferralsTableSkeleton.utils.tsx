import {
  VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useTranslation } from "react-i18next"

import Skeleton from "react-loading-skeleton"
import { useMemo } from "react"

export const useReferralsTableSkeleton = (enableAnimation = true) => {
  const { t } = useTranslation()
  const { display } = createColumnHelper()

  const columnVisibility: VisibilityState = {
    account: true,
    volume: true,
    rewards: true,
    tier: true,
    actions: true,
  }

  const columns = useMemo(
    () => [
      display({
        id: "account",
        header: t("referrals.table.header.account"),
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
        id: "volume",
        header: t("referrals.table.header.volume"),
        cell: () => (
          <div sx={{ flex: "row", justify: ["end", "start"] }}>
            <Skeleton
              width={72}
              height={26}
              enableAnimation={enableAnimation}
            />
          </div>
        ),
      }),
      display({
        id: "rewards",
        header: t("referrals.table.header.rewards"),
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
        id: "tier",
        header: t("referrals.table.header.tier"),
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
        id: "actions",
        cell: () => (
          <div sx={{ flex: "row", pr: 20 }}>
            <Skeleton
              width={60}
              height={26}
              enableAnimation={enableAnimation}
            />
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enableAnimation],
  )

  return useReactTable({
    data: mockData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { columnVisibility },
  })
}

const mockData = [1, 2, 3, 4, 5]
