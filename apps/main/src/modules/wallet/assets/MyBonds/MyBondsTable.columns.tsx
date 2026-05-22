import {
  Amount,
  Flex,
  Modal,
  TableRowAction,
} from "@galacticcouncil/ui/components"
import { createColumnHelper } from "@tanstack/react-table"
import { differenceInMilliseconds } from "date-fns"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { TBond } from "@/api/assets"
import { AssetLabelFull } from "@/components/AssetLabelFull"
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
      cell: ({ row }) => {
        const timeLeft = differenceInMilliseconds(
          new Date(row.original.maturity),
          new Date(),
        )
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
            <TableRowAction disabled>
              {t("myBonds.actions.redeem")}
            </TableRowAction>
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

    return [assetColumn, totalColumn, maturityColumn, actionsColumn]
  }, [t])
}
