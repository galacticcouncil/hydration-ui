import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { useMemo } from "react"
import { Config } from "sections/trade/sections/bonds/table/BondsTable.utils"

export const useBondsSkeleton = (config?: Config) => {
  const { t } = useTranslation()
  const { display } = createColumnHelper()
  const enableAnimation = config?.enableAnimation ?? true

  const columns = useMemo(
    () => [
      display({
        header: t("bonds.table.bond"),
        cell: () => (
          <Skeleton width={64} height={32} enableAnimation={enableAnimation} />
        ),
      }),
      display({
        header: t("bonds.table.maturity"),
        cell: () => (
          <Skeleton
            width="100%"
            height={32}
            enableAnimation={enableAnimation}
          />
        ),
      }),
      display({
        header: t("bonds.table.balance"),
        cell: () => (
          <Skeleton
            width="100%"
            height={32}
            enableAnimation={enableAnimation}
          />
        ),
      }),
      display({
        header: t("bonds.table.price"),
        cell: () => (
          <Skeleton
            width="100%"
            height={32}
            enableAnimation={enableAnimation}
          />
        ),
      }),
      display({
        id: "actions",
        cell: () => (
          <div>
            {config?.showTransfer && (
              <Skeleton
                width={72}
                height={32}
                enableAnimation={enableAnimation}
              />
            )}
            {config?.showTransactions && (
              <Skeleton
                width={24}
                height={24}
                enableAnimation={enableAnimation}
              />
            )}
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config?.showTransactions],
  )

  return useReactTable({
    data: mockData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
}

const mockData = [1, 2, 3, 4]
