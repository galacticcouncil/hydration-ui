import {
  VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { useMemo } from "react"
import { Config } from "sections/trade/sections/bonds/table/BondsTable.utils"
import { useMedia } from "react-use"
import { theme } from "theme"

export const useBondsSkeleton = (config?: Config) => {
  const { t } = useTranslation()
  const { display } = createColumnHelper()
  const enableAnimation = config?.enableAnimation ?? true

  const isDesktop = useMedia(theme.viewport.gte.sm)

  const columnVisibility: VisibilityState = {
    assetId: true,
    maturity: isDesktop,
    balance: true,
    price: isDesktop,
    actions: isDesktop,
  }

  const columns = useMemo(
    () => [
      display({
        id: "assetId",
        header: t("bond"),
        cell: () => (
          <Skeleton width={64} height={32} enableAnimation={enableAnimation} />
        ),
      }),
      display({
        id: "maturity",
        header: t("bonds.maturity"),
        cell: () => (
          <Skeleton
            width="100%"
            height={32}
            enableAnimation={enableAnimation}
          />
        ),
      }),
      display({
        id: "balance",
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
        id: "price",
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
    [config?.showTransactions, isDesktop],
  )

  return useReactTable({
    data: mockData,
    columns,
    state: { columnVisibility },
    getCoreRowModel: getCoreRowModel(),
  })
}

const mockData = [1, 2, 3, 4]
