import { Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { HYDRATION_CHAIN_KEY, subscan } from "@galacticcouncil/utils"
import { MultisigHistoryByAccountIdQuery } from "@galacticcouncil/web3-connect"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import type { MultisigHistoryStatus } from "@/api/multisig"
import { MultisigCallNameCell } from "@/modules/multisig/MultisigCallNameCell"
import { getMultisigHistoryGroupSubscanHref } from "@/modules/multisig/MultisigDetailHistory.utils"
import { MultisigHistoryStatusChip } from "@/modules/multisig/MultisigHistoryStatusChip"
import type { AnyPapiTx } from "@/modules/transactions/types"

export type MultisigHistoryCall =
  MultisigHistoryByAccountIdQuery["multisigCalls"][number]

export type MultisigDetailHistoryRawEvent = {
  call: MultisigHistoryCall
  proposalKey: string
  decodedTx: AnyPapiTx | null
  timestamp: number | null
  signerAddress: string | null
  methodName: string
  isLoading: boolean
}

export type MultisigDetailHistoryEvent = MultisigDetailHistoryRawEvent & {
  status: MultisigHistoryStatus
}

export type MultisigDetailHistoryGroup = {
  id: string
  methodName: string
  status: MultisigHistoryStatus
  approvalCount: number
  threshold: number
  timestamp: number | null
  events: MultisigDetailHistoryEvent[]
  isLoading: boolean
}

export type MultisigDetailHistoryTableRow = MultisigDetailHistoryGroup | Date

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

        const blockHash = getMultisigHistoryGroupSubscanHref(row.original)
        const subscanHref = blockHash
          ? subscan.block(HYDRATION_CHAIN_KEY, blockHash)
          : undefined

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

        return (
          <MultisigHistoryStatusChip
            status={row.original.status}
            approvalCount={row.original.approvalCount}
            threshold={row.original.threshold}
            isLoading={row.original.isLoading}
          />
        )
      },
    })

    return [nameColumn, statusColumn]
  }, [t])
}

export const isMultisigDetailHistoryGroup = (
  row: MultisigDetailHistoryTableRow,
): row is MultisigDetailHistoryGroup => !(row instanceof Date)
