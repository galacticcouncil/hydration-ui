import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"

export const useHydraPositionsTableSkeleton = (enableAnimation = true) => {
  const { t } = useTranslation()
  const { display } = createColumnHelper()

  const columns = [
    display({
      id: "name",
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
      id: "value",
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
      id: "price",
      header: t("wallet.assets.hydraPositions.header.valueUSD"),
      cell: () => (
        <div>
          <Skeleton width={134} height={32} enableAnimation={enableAnimation} />
        </div>
      ),
    }),
  ]

  return useReactTable({
    data: mockData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
}

const mockData = [1, 2]
