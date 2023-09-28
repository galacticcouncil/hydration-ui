import {
  VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Icon } from "components/Icon/Icon"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"
//import LinkIcon from "assets/icons/LinkIcon.svg?react"
import TradeIcon from "assets/icons/TradeTypeIcon.svg?react"
import Skeleton from "react-loading-skeleton"
import { useMemo } from "react"

export const useRecentTradesTableSkeleton = (enableAnimation = true) => {
  const { t } = useTranslation()
  const { display } = createColumnHelper()

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    isBuy: true,
    account: isDesktop,
    totalValue: true,
    trade: isDesktop,
    date: isDesktop,
  }

  const columns = useMemo(
    () => [
      display({
        id: "type",
        header: t("stats.overview.table.trades.header.action"),
        cell: () => (
          <div
            sx={{
              flex: "row",
              gap: 8,
              align: "center",
              justify: "start",
            }}
          >
            {isDesktop ? (
              <Skeleton
                width={72}
                height={26}
                enableAnimation={enableAnimation}
              />
            ) : (
              <div sx={{ flex: "row", align: "center", gap: 6 }}>
                <Skeleton
                  width={20}
                  height={20}
                  circle
                  enableAnimation={enableAnimation}
                />
                <Skeleton
                  width={52}
                  height={20}
                  enableAnimation={enableAnimation}
                />

                <Icon sx={{ color: "brightBlue600" }} icon={<TradeIcon />} />

                <Skeleton
                  width={20}
                  height={20}
                  circle
                  enableAnimation={enableAnimation}
                />
                <Skeleton
                  width={52}
                  height={20}
                  enableAnimation={enableAnimation}
                />
              </div>
            )}
          </div>
        ),
      }),
      display({
        id: "account",
        header: t("stats.overview.table.trades.header.account"),
        cell: () => (
          <div sx={{ flex: "row", justify: "center" }}>
            <Skeleton
              width={72}
              height={26}
              enableAnimation={enableAnimation}
            />
          </div>
        ),
      }),
      display({
        id: "totalValue",
        header: t("stats.overview.table.trades.header.totalValue"),
        cell: () =>
          isDesktop ? (
            <div sx={{ flex: "row", justify: "center" }}>
              <Skeleton
                width={72}
                height={26}
                enableAnimation={enableAnimation}
              />
            </div>
          ) : (
            <div sx={{ flex: "column", align: "flex-end" }}>
              <Skeleton
                width={52}
                height={16}
                enableAnimation={enableAnimation}
              />
              <Skeleton
                width={52}
                height={12}
                enableAnimation={enableAnimation}
              />
            </div>
          ),
      }),
      display({
        id: "trade",
        cell: () => {
          return (
            <div
              sx={{ flex: "row", align: "center", gap: 6, justify: "center" }}
            >
              <Skeleton
                width={22}
                height={22}
                circle
                enableAnimation={enableAnimation}
              />
              <Skeleton
                width={72}
                height={26}
                enableAnimation={enableAnimation}
              />

              <Icon sx={{ color: "brightBlue600" }} icon={<TradeIcon />} />

              <Skeleton
                width={22}
                height={22}
                circle
                enableAnimation={enableAnimation}
              />
              <Skeleton
                width={72}
                height={26}
                enableAnimation={enableAnimation}
              />
            </div>
          )
        },
      }),
      display({
        id: "date",
        header: t("stats.overview.table.trades.header.timeStamp"),
        cell: () => (
          <Skeleton width={72} height={26} enableAnimation={enableAnimation} />
        ),
      }),
      /* display({
        id: "pol",
        header: t("stats.overview.table.trades.header.subscan"),
        cell: () => (
            <Skeleton width={22} height={22}  circle enableAnimation={enableAnimation} />
        ),
      }),*/
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
