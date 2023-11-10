import {
  VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { useMemo } from "react"
import { useMedia } from "react-use"
import { theme } from "theme"

export const useHydraPositionsTableSkeleton = (enableAnimation = true) => {
  const { t } = useTranslation()
  const { display } = createColumnHelper()

  const isDesktop = useMedia(theme.viewport.gte.sm)

  const columnVisibility: VisibilityState = {
    symbol: true,
    providedAmount: isDesktop,
    valueDisplay: true,
  }

  const columns = useMemo(
    () => [
      display({
        id: "symbol",
        header: t("wallet.assets.hydraPositions.header.name"),
        cell: () => (
          <div sx={{ flex: "row", gap: 8, height: [24, 32] }}>
            <div sx={{ width: [24, 32] }}>
              <Skeleton
                width="100%"
                height="100%"
                enableAnimation={enableAnimation}
              />
            </div>
            <Skeleton
              width={64}
              height="100%"
              enableAnimation={enableAnimation}
            />
          </div>
        ),
      }),
      display({
        id: "providedAmount",
        header: t("wallet.assets.hydraPositions.header.providedAmount"),
        cell: () => (
          <div
            sx={{ width: [90, 134], height: [24, 32], ml: ["auto", "initial"] }}
          >
            <Skeleton
              width="100%"
              height="100%"
              enableAnimation={enableAnimation}
            />
          </div>
        ),
      }),
      display({
        id: "valueDisplay",
        header: t("wallet.assets.hydraPositions.header.valueUSD"),
        cell: () => (
          <div>
            <Skeleton
              width={134}
              height={32}
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

const mockData = [1, 2]
