import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { useMemo } from "react"

export const useFarmingPositionsSkeleton = (enableAnimation = true) => {
  const { t } = useTranslation()
  const { display } = createColumnHelper()

  const columns = useMemo(
    () => [
      display({
        id: "name",
        header: t("wallet.assets.farmingPositions.header.name"),
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
        id: "date",
        header: t("wallet.assets.farmingPositions.header.date"),
        cell: () => (
          <Skeleton width={134} height={32} enableAnimation={enableAnimation} />
        ),
      }),
      display({
        id: "initial",
        header: t("wallet.assets.farmingPositions.header.initial"),
        cell: () => (
          <Skeleton width={134} height={32} enableAnimation={enableAnimation} />
        ),
      }),
      display({
        id: "value",
        header: t("wallet.assets.farmingPositions.header.value"),
        cell: () => (
          <Skeleton width={134} height={32} enableAnimation={enableAnimation} />
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
  })
}

const mockData = [1, 2, 3, 4]
