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

export const useLiquidityProvidersTableSkeleton = (enableAnimation = true) => {
  const { t } = useTranslation()
  const { display } = createColumnHelper()

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    account: true,
    position: true,
    tvl: isDesktop,
    share: isDesktop,
    actions: isDesktop,
  }

  const columns = useMemo(
    () => [
      display({
        id: "account",
        header: t("account"),
        cell: () => (
          <div sx={{ flex: "row" }}>
            <Skeleton
              width={isDesktop ? 72 : 52}
              height={isDesktop ? 26 : 20}
              enableAnimation={enableAnimation}
            />
          </div>
        ),
      }),
      display({
        id: "position",
        header: t("position"),
        cell: () => (
          <div sx={{ flex: "row", justify: ["end", "start"] }}>
            <Skeleton
              width={isDesktop ? 72 : 52}
              height={isDesktop ? 26 : 20}
              enableAnimation={enableAnimation}
            />
          </div>
        ),
      }),
      display({
        id: "tvl",
        header: t("totalValueLocked"),
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
        id: "share",
        header: t("stats.omnipool.table.header.share"),
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
          <div sx={{ flex: "row" }}>
            <Skeleton
              width={26}
              height={26}
              enableAnimation={enableAnimation}
            />
          </div>
        ),
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
