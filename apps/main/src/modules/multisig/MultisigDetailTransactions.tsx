import Casette from "@galacticcouncil/ui/assets/images/Casette.webp"
import { DataTable, TableContainer } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import {
  safeConvertAddressSS58,
  safeConvertPublicKeyToSS58,
} from "@galacticcouncil/utils"
import { MultisigConfig } from "@galacticcouncil/web3-connect"
import { QueriesResults, useQueries } from "@tanstack/react-query"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { sortBy } from "remeda"

import {
  decodedMultisigTxQuery,
  parseMultisigProposalMethodName,
  useMultisigPendingTxs,
} from "@/api/multisig"
import { EmptyState } from "@/components/EmptyState/EmptyState"
import { StackedTable } from "@/modules/borrow/dashboard/components/StackedTable"
import {
  MultisigDetailTransactionRow,
  useMultisigDetailTransactionsColumns,
} from "@/modules/multisig/MultisigDetailTransactions.columns"
import type { AnyPapiTx } from "@/modules/transactions/types"
import { useMultisigContext } from "@/providers/MultisigProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

type Props = {
  config: MultisigConfig
}

type DecodedResult = {
  tx: AnyPapiTx | null
  timestamp: number
}

export const MultisigDetailTransactions: React.FC<Props> = ({ config }) => {
  const { t } = useTranslation()
  const { isMobile, isTablet } = useBreakpoints()
  const { papi, papiClient, isLoaded } = useRpcProvider()
  const { multisigs } = useMultisigContext()
  const { data: pendingTxs = [], isPending: isPendingTxsLoading } =
    useMultisigPendingTxs(config.address)

  const normalized = safeConvertAddressSS58(config.address)
  const multisigAccount = multisigs.find(
    (multisig) => safeConvertPublicKeyToSS58(multisig.pubKey) === normalized,
  )
  const columns = useMultisigDetailTransactionsColumns(multisigAccount)

  const rows = useQueries({
    queries: pendingTxs.map((tx) =>
      decodedMultisigTxQuery(papi, papiClient, tx, isLoaded),
    ),
    combine: useCallback(
      (results: QueriesResults<Array<DecodedResult>>) => {
        const rows: MultisigDetailTransactionRow[] = pendingTxs.map((tx, i) => {
          const query = results[i]
          const decoded = (query?.data ?? null) as DecodedResult | null
          const methodName = decoded?.tx
            ? parseMultisigProposalMethodName(decoded.tx)
            : ""
          return {
            tx,
            decodedTx: decoded?.tx ?? null,
            timestamp: decoded?.timestamp ?? null,
            methodName,
            isLoading: !!query?.isLoading,
            threshold: config.threshold,
          }
        })

        return sortBy(rows, [(row) => row.timestamp ?? -Infinity, "desc"])
      },
      [pendingTxs, config.threshold],
    ),
  })

  if (!isPendingTxsLoading && rows.length === 0) {
    return (
      <EmptyState
        sx={{ py: "xxxl" }}
        image={Casette}
        header={t("multisig.detail.transactions.empty.title")}
        description={t("multisig.detail.transactions.empty.description")}
      />
    )
  }

  if (isMobile || isTablet) {
    return (
      <StackedTable
        data={rows}
        columns={columns}
        isLoading={isPendingTxsLoading}
        skeletonRowCount={4}
      />
    )
  }

  return (
    <TableContainer borderRadius="xl">
      <DataTable
        data={rows}
        columns={columns}
        isLoading={isPendingTxsLoading}
        size="small"
      />
    </TableContainer>
  )
}
