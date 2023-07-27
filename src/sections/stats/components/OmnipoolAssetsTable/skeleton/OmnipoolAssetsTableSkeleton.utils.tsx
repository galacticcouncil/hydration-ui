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
import { ButtonTransparent } from "components/Button/Button"
import { ReactComponent as ChevronRightIcon } from "assets/icons/ChevronRight.svg"
import { useMemo } from "react"

export const useOmnipoolAssetsTableSkeleton = (enableAnimation = true) => {
  const { t } = useTranslation()
  const { display } = createColumnHelper()

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const columnVisibility: VisibilityState = {
    symbol: true,
    tvl: true,
    volume: isDesktop,
    fee: isDesktop,
    pol: isDesktop,
    actions: isDesktop,
  }

  const columns = useMemo(
    () => [
      display({
        id: "symbol",
        header: t("stats.overview.table.assets.header.asset"),
        cell: () => (
          <div sx={{ flex: "row", gap: 6, align: "center" }}>
            <Skeleton
              width={26}
              height={26}
              circle
              enableAnimation={enableAnimation}
            />
            {isDesktop ? (
              <Skeleton
                width={72}
                height={26}
                enableAnimation={enableAnimation}
              />
            ) : (
              <div>
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
            )}
          </div>
        ),
      }),
      display({
        id: "tvl",
        header: t("stats.overview.table.assets.header.tvl"),
        cell: () => (
          <div sx={{ flex: "row", justify: ["end", "center"] }}>
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
        header: t("stats.overview.table.assets.header.volume"),
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
      /*display({
      id: "fee",
      header: t("stats.overview.table.assets.header.fee"),
      cell: () => {
        return (
          <Skeleton width={72} height={26} enableAnimation={enableAnimation} />
        )
      },
    }),*/
      display({
        id: "pol",
        header: t("stats.overview.table.assets.header.pol"),
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
    [isDesktop, enableAnimation],
  )

  return useReactTable({
    data: mockData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { columnVisibility },
  })
}

const mockData = [1, 2, 3, 4, 5]
