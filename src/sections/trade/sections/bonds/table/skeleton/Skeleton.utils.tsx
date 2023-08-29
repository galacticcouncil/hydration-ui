import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { useMemo } from "react"
import { Config } from "sections/trade/sections/bonds/table/BondsTable.utils"

export const useMyActiveBondsSkeleton = (config?: Config) => {
  const { t } = useTranslation()
  const { display } = createColumnHelper()

  const columns = useMemo(
    () => [
      display({
        header: t("bonds.table.bond"),
        cell: () => <Skeleton width={64} height={32} />,
      }),
      display({
        header: t("bonds.table.maturity"),
        cell: () => <Skeleton width="100%" height={32} />,
      }),
      display({
        header: t("bonds.table.balance"),
        cell: () => <Skeleton width="100%" height={32} />,
      }),
      display({
        id: "actions",
        cell: () => (
          <div sx={{ flex: "row", gap: 8, mr: 32, display: ["none", "flex"] }}>
            {config?.showTransactions && <Skeleton width={72} height={32} />}
          </div>
        ),
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
    ],
    [config?.showTransactions],
  )

  return useReactTable({
    data: mockData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
}

const mockData = [1, 2, 3, 4]
