import Casette from "@galacticcouncil/ui/assets/images/Casette.webp"
import { DataTable, TableContainer } from "@galacticcouncil/ui/components"
import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import {
  MultisigConfig,
  multisigHistoryByAccountIdQuery,
  useMultixClient,
} from "@galacticcouncil/web3-connect"
import { QueriesResults, useQueries, useQuery } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"

import {
  decodedMultisigCallQuery,
  type DecodedMultisigCallResult,
  getOuterMultisigCallType,
} from "@/api/multisig"
import { EmptyState } from "@/components/EmptyState/EmptyState"
import { useDataTableUrlPagination } from "@/hooks/useDataTableUrlPagination"
import { useMultisigDetailHistoryColumns } from "@/modules/multisig/MultisigDetailHistory.columns"
import { groupMultisigHistoryByDate } from "@/modules/multisig/MultisigDetailHistory.utils"
import { parseTxMethodName } from "@/modules/transactions/utils/tx"
import { useRpcProvider } from "@/providers/rpcProvider"

type Props = {
  config: MultisigConfig
}

const PAGE_SIZE = 10

const parseTimestamp = (value: unknown): number | null => {
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return null
  return date.getTime()
}

export const MultisigDetailHistory: React.FC<Props> = ({ config }) => {
  const { t } = useTranslation()
  const { papi, papiClient, isLoaded } = useRpcProvider()
  const multixSdk = useMultixClient()
  const columns = useMultisigDetailHistoryColumns()
  const paginationProps = useDataTableUrlPagination(
    "/multisigs/",
    "page",
    PAGE_SIZE,
  )

  const publicKey = safeConvertSS58toPublicKey(config.address)
  const accountId = publicKey ? `hydradx-${publicKey}` : ""

  const { data } = useQuery(
    multisigHistoryByAccountIdQuery(multixSdk, accountId),
  )

  const pageStart = paginationProps.pagination.pageIndex * PAGE_SIZE
  const pageEnd = pageStart + PAGE_SIZE
  const calls = useMemo(() => data?.multisigCalls ?? [], [data?.multisigCalls])

  const rows = useQueries({
    queries: calls.map((call, index) => ({
      ...decodedMultisigCallQuery(papi, papiClient, call, isLoaded),
      enabled: index >= pageStart && index < pageEnd,
    })),
    combine: useCallback(
      (results: QueriesResults<Array<DecodedMultisigCallResult>>) => {
        const rows = calls.map((call, i) => {
          const query = results[i]
          const decoded = (query?.data ??
            null) as DecodedMultisigCallResult | null
          const tx = decoded?.proposalTx ?? decoded?.tx ?? null
          const methodName = tx
            ? (parseTxMethodName(tx, "value.value.call") ?? "")
            : ""
          const outerType = getOuterMultisigCallType(decoded?.tx)

          return {
            call,
            decodedTx: decoded?.tx ?? null,
            timestamp: parseTimestamp(call.timestamp),
            methodName,
            isRejected: outerType === "cancel_as_multi",
            isLoading: !!query?.isLoading,
          }
        })
        return groupMultisigHistoryByDate(rows)
      },
      [calls],
    ),
  })

  return (
    <TableContainer borderRadius="xl">
      <DataTable
        paginated
        {...paginationProps}
        data={rows}
        columns={columns}
        size="small"
        emptyState={
          <EmptyState
            sx={{ py: "xxxl" }}
            image={Casette}
            header={t("multisig.detail.history.empty.title")}
            description={t("multisig.detail.history.empty.description")}
          />
        }
      />
    </TableContainer>
  )
}
