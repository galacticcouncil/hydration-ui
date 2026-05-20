import { Chip, Skeleton, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { HYDRATION_CHAIN_KEY, subscan } from "@galacticcouncil/utils"
import { MultisigHistoryByAccountIdQuery } from "@galacticcouncil/web3-connect"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { MultisigCallNameCell } from "@/modules/multisig/MultisigCallNameCell"
import type { AnyPapiTx } from "@/modules/transactions/types"

export type MultisigHistoryCall =
  MultisigHistoryByAccountIdQuery["multisigCalls"][number]

export type MultisigDetailHistoryRow = {
  call: MultisigHistoryCall
  decodedTx: AnyPapiTx | null
  methodName: string
  timestamp: number | null
  isRejected: boolean
  isLoading: boolean
}

export type MultisigDetailHistoryTableRow = MultisigDetailHistoryRow | Date

const columnHelper = createColumnHelper<MultisigDetailHistoryTableRow>()

export enum MultisigDetailHistoryTableColumn {
  Name = "name",
  Status = "status",
  Date = "date",
}

export const useMultisigDetailHistoryColumns = () => {
  const { t } = useTranslation()

  return useMemo(() => {
    const nameColumn = columnHelper.display({
      id: MultisigDetailHistoryTableColumn.Name,
      header: t("multisig.detail.history.column.name"),
      cell: ({ row }) => {
        if (row.original instanceof Date) {
          return (
            <Text fs="p5" fw={500} color={getToken("text.medium")}>
              {t("date.long", {
                value: row.original,
              })}
            </Text>
          )
        }

        const subscanHref = subscan.block(
          HYDRATION_CHAIN_KEY,
          row.original.call.blockHash,
        )

        return (
          <MultisigCallNameCell
            methodName={row.original.methodName}
            fallbackLabel={t("multisig.detail.history.unknownCall")}
            subscanHref={subscanHref}
            isLoading={row.original.isLoading}
          />
        )
      },
    })

    const statusColumn = columnHelper.display({
      id: MultisigDetailHistoryTableColumn.Status,
      header: t("multisig.detail.history.column.status"),
      meta: {
        sx: {
          textAlign: "right",
        },
      },
      cell: ({ row }) => {
        if (row.original instanceof Date) {
          return null
        }

        if (row.original.isLoading) {
          return <Skeleton sx={{ width: "3xl" }} />
        }

        return row.original.isRejected ? (
          <Chip variant="red" size="small">
            {t("multisig.detail.history.status.rejected")}
          </Chip>
        ) : (
          <Chip variant="green" size="small">
            {t("multisig.detail.history.status.executed")}
          </Chip>
        )
      },
    })

    return [nameColumn, statusColumn]
  }, [t])
}
