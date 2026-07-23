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
  getMultisigCallerAddress,
  getMultisigProposalTimepointKey,
  parseMultisigProposalMethodName,
} from "@/api/multisig"
import { EmptyState } from "@/components/EmptyState/EmptyState"
import { useDataTableUrlPagination } from "@/hooks/useDataTableUrlPagination"
import {
  isMultisigDetailHistoryGroup,
  useMultisigDetailHistoryColumns,
} from "@/modules/multisig/MultisigDetailHistory.columns"
import {
  groupMultisigHistoryByDate,
  groupMultisigHistoryByProposal,
} from "@/modules/multisig/MultisigDetailHistory.utils"
import { MultisigDetailHistoryTimeline } from "@/modules/multisig/MultisigDetailHistoryTimeline"
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

  const calls = useMemo(() => data?.multisigCalls ?? [], [data?.multisigCalls])
  const signatories = useMemo(() => config.signers, [config.signers])

  const rows = useQueries({
    queries: calls.map((call) =>
      decodedMultisigCallQuery(papi, papiClient, call, isLoaded),
    ),
    combine: useCallback(
      (results: QueriesResults<Array<DecodedMultisigCallResult>>) => {
        const events = calls.map((call, i) => {
          const query = results[i]
          const decoded = (query?.data ??
            null) as DecodedMultisigCallResult | null
          const tx = decoded?.proposalTx ?? decoded?.tx ?? null
          const methodName = tx ? parseMultisigProposalMethodName(tx) : ""

          return {
            call,
            proposalKey: getMultisigProposalTimepointKey(
              decoded?.blockHeight ?? null,
              call.callIndex,
              decoded?.tx,
              call.id,
            ),
            decodedTx: decoded?.tx ?? null,
            timestamp: parseTimestamp(call.timestamp),
            methodName,
            signerAddress: getMultisigCallerAddress(decoded?.tx, signatories),
            isLoading: !!query?.isLoading,
          }
        })

        return groupMultisigHistoryByDate(
          groupMultisigHistoryByProposal(events, config.threshold),
        )
      },
      [calls, config.threshold, signatories],
    ),
  })

  return (
    <TableContainer borderRadius="xl">
      <DataTable
        paginated
        expandable
        {...paginationProps}
        data={rows}
        columns={columns}
        size="small"
        getIsExpandable={isMultisigDetailHistoryGroup}
        renderSubComponent={(row) => {
          if (!isMultisigDetailHistoryGroup(row)) return <></>
          return <MultisigDetailHistoryTimeline group={row} />
        }}
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
