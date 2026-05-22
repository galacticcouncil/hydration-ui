import {
  Amount,
  Flex,
  Modal,
  TableRowAction,
  TableRowDetailsExpand,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { TBond } from "@/api/assets"
import { useBondData } from "@/api/bonds"
import { AssetLabelFull } from "@/components/AssetLabelFull"
import { BondRedeemButton } from "@/components/BondRedeemButton"
import { TransferPositionModal } from "@/modules/wallet/assets/Transfer/TransferPositionModal"
import { naturally, numerically, numericallyStr, sortBy } from "@/utils/sort"

export enum MyBondsTableColumnId {
  Asset = "asset",
  Total = "total",
  Maturity = "maturity",
  Actions = "actions",
}

export type MyBond = TBond & {
  readonly total: string
  readonly totalDisplay: string | undefined
}

const columnHelper = createColumnHelper<MyBond>()

export const useMyBondsColumns = () => {
  const { t } = useTranslation(["wallet", "common"])
  const { isMobile } = useBreakpoints()

  return useMemo(() => {
    const assetColumn = columnHelper.accessor("symbol", {
      id: MyBondsTableColumnId.Asset,
      header: t("common:bond"),
      sortingFn: sortBy({
        select: (row) => row.original.symbol,
        compare: naturally,
      }),
      cell: ({ row }) => {
        return <AssetLabelFull asset={row.original} />
      },
    })

    const assetColumnMobile = columnHelper.accessor("symbol", {
      id: MyBondsTableColumnId.Asset,
      enableSorting: false,
      header: t("common:bond"),
      cell: ({ row }) => {
        return <AssetLabelFull asset={row.original} withName={false} />
      },
    })

    const totalColumnMobile = columnHelper.accessor("total", {
      id: MyBondsTableColumnId.Total,
      header: t("myBonds.header.total"),
      meta: {
        sx: {
          textAlign: "right",
        },
      },
      sortingFn: sortBy({
        select: (row) => row.original.totalDisplay || "0",
        compare: numericallyStr,
      }),
      cell: ({ row }) => (
        <TableRowDetailsExpand>
          <Amount
            variant="default"
            value={t("common:number", {
              value: row.original.total,
            })}
            displayValue={row.original.totalDisplay}
          />
        </TableRowDetailsExpand>
      ),
    })

    const totalColumn = columnHelper.accessor("total", {
      id: MyBondsTableColumnId.Total,
      header: t("myBonds.header.total"),
      sortingFn: sortBy({
        select: (row) => row.original.totalDisplay || "0",
        compare: numericallyStr,
      }),
      cell: ({ row }) => (
        <Amount
          value={t("common:number", {
            value: row.original.total,
          })}
          displayValue={row.original.totalDisplay}
        />
      ),
    })

    const maturityColumn = columnHelper.accessor("maturity", {
      id: MyBondsTableColumnId.Maturity,
      header: t("myBonds.header.maturity"),
      sortingFn: sortBy({
        select: (row) => row.original.maturity,
        compare: numerically,
      }),
      cell: function Cell({ row }) {
        const { timeLeft } = useBondData(row.original.id)

        return (
          <Amount
            value={t("common:date.date", {
              value: new Date(row.original.maturity),
            })}
            displayValue={
              timeLeft > 0
                ? t("common:interval.daysLeft", {
                    value: timeLeft,
                  })
                : undefined
            }
          />
        )
      },
    })

    const actionsColumn = columnHelper.display({
      id: MyBondsTableColumnId.Actions,
      header: t("common:actions"),
      meta: {
        sx: {
          textAlign: "right",
        },
      },
      cell: function Cell({ row }) {
        const [isTransferOpen, setIsTransferOpen] = useState(false)

        return (
          <Flex gap="base" justify="flex-end">
            <BondRedeemButton bondId={row.original.id} />
            <TableRowAction onClick={() => setIsTransferOpen(true)}>
              {t("common:send")}
            </TableRowAction>
            <Modal
              variant="popup"
              open={isTransferOpen}
              onOpenChange={() => setIsTransferOpen(false)}
            >
              {isTransferOpen && (
                <TransferPositionModal
                  assetId={row.original.id}
                  onClose={() => setIsTransferOpen(false)}
                />
              )}
            </Modal>
          </Flex>
        )
      },
    })

    return isMobile
      ? ([assetColumnMobile, totalColumnMobile] as Array<ColumnDef<MyBond>>)
      : ([assetColumn, totalColumn, maturityColumn, actionsColumn] as Array<
          ColumnDef<MyBond>
        >)
  }, [isMobile, t])
}
