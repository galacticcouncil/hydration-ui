import {
  Box,
  Button,
  Flex,
  ModalContent,
  ModalRoot,
  ModalTrigger,
  ProgressBar,
  Text,
} from "@galacticcouncil/ui/components"
import { HYDRATION_CHAIN_KEY, subscan } from "@galacticcouncil/utils"
import {
  MultisigAccount,
  MultisigPendingTx,
} from "@galacticcouncil/web3-connect"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { MultisigCallDateCell } from "@/modules/multisig/MultisigCallDateCell"
import { MultisigCallNameCell } from "@/modules/multisig/MultisigCallNameCell"
import { ReviewMultisigAction } from "@/modules/transactions/review/ReviewMultisig/components/ReviewMultisigAction"
import { ReviewMultisig } from "@/modules/transactions/review/ReviewMultisig/ReviewMultisig"
import type { AnyPapiTx } from "@/modules/transactions/types"

export type MultisigDetailTransactionRow = {
  tx: MultisigPendingTx
  decodedTx: AnyPapiTx | null
  timestamp: number | null
  methodName: string
  isLoading: boolean
  threshold: number
}

const columnHelper = createColumnHelper<MultisigDetailTransactionRow>()

export enum MultisigDetailTransactionsTableColumn {
  Name = "name",
  Progress = "progress",
  Date = "date",
  Actions = "actions",
}

export const useMultisigDetailTransactionsColumns = (
  multisig: MultisigAccount | undefined,
) => {
  const { t } = useTranslation()

  return useMemo(() => {
    const nameColumn = columnHelper.display({
      id: MultisigDetailTransactionsTableColumn.Name,
      header: t("multisig.detail.history.column.name"),
      cell: ({ row }) => {
        const subscanHref = subscan.multisigExtrinsic(
          HYDRATION_CHAIN_KEY,
          row.original.tx.when.height,
          row.original.tx.when.index,
          row.original.tx.callHash,
        )

        return (
          <MultisigCallNameCell
            methodName={row.original.methodName}
            fallbackLabel={t("multisig.detail.transactions.unknownMethod")}
            subscanHref={subscanHref}
            isLoading={row.original.isLoading}
          />
        )
      },
    })

    const progressColumn = columnHelper.display({
      id: MultisigDetailTransactionsTableColumn.Progress,
      header: t("multisig.detail.transactions.column.progress"),
      cell: ({ row }) => {
        const approvedCount = row.original.tx.approvals.length
        const threshold = row.original.threshold
        const progress = threshold > 0 ? (approvedCount / threshold) * 100 : 0

        return (
          <Box width="8rem">
            <ProgressBar
              animated={false}
              value={progress}
              customLabel={
                <Text fs="p5" fw={600}>
                  {approvedCount}/{threshold}
                </Text>
              }
            />
          </Box>
        )
      },
    })

    const dateColumn = columnHelper.display({
      id: MultisigDetailTransactionsTableColumn.Date,
      header: t("date"),
      cell: ({ row }) => (
        <MultisigCallDateCell
          whiteSpace="nowrap"
          timestamp={row.original.timestamp}
          isLoading={row.original.isLoading}
        />
      ),
    })

    const actionsColumn = columnHelper.display({
      id: MultisigDetailTransactionsTableColumn.Actions,
      meta: {
        sx: { textAlign: "right" },
      },
      cell: ({ row }) => {
        if (!multisig) return null
        return (
          <Flex justify="flex-end" gap="s" align="center">
            <ReviewMultisigAction
              tx={row.original.tx}
              multisig={multisig}
              size="small"
            />
            <ModalRoot>
              <ModalTrigger asChild>
                <Button size="small" variant="secondary">
                  {t("multisig.review")}
                </Button>
              </ModalTrigger>
              <ModalContent onInteractOutside={(e) => e.preventDefault()}>
                <ReviewMultisig tx={row.original.tx} multisig={multisig} />
              </ModalContent>
            </ModalRoot>
          </Flex>
        )
      },
    })

    return [nameColumn, dateColumn, progressColumn, actionsColumn]
  }, [multisig, t])
}
