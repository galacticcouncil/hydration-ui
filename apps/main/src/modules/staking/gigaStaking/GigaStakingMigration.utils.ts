import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { userGigaBorrowSummaryQueryKey } from "@/api/borrow"
import { accountOpenGovVotesQuery } from "@/api/democracy"
import { evmAccountBindingQuery } from "@/api/evm"
import {
  HDXSupplyQueryKey,
  processedVotesQuery,
  stakingPositionsQuery,
} from "@/api/staking"
import { getProcessedVoteIds } from "@/modules/staking/Stake.data"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { toDecimal } from "@/utils/formatting"

export const useGigaStakingMigration = () => {
  const { t } = useTranslation("staking")
  const { native } = useAssets()
  const rpc = useRpcProvider()
  const { papi } = rpc
  const { account } = useAccount()
  const createBatch = useCreateBatchTx()

  return useMutation({
    mutationFn: async (stakeAmount: string) => {
      if (!account) throw new Error("No account connected")

      const { address } = account
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const [{ votes }, processedVotes, isBound] = await Promise.all([
        rpc.queryClient.ensureQueryData(accountOpenGovVotesQuery(rpc, address)),
        rpc.queryClient.ensureQueryData(
          processedVotesQuery(rpc, address, true),
        ),
        rpc.queryClient.ensureQueryData(evmAccountBindingQuery(rpc, address)),
      ])

      const { newProcessedVotesIds, oldProcessedVotesIds } =
        getProcessedVoteIds(votes, processedVotes)

      const migrateTx = unsafeApi.tx.GigaHdx.migrate()

      const mainTxs = !isBound
        ? [papi.tx.EVMAccounts.bind_evm_address(), migrateTx]
        : [migrateTx]

      const txs =
        !newProcessedVotesIds.length && !oldProcessedVotesIds.length
          ? mainTxs
          : [
              ...oldProcessedVotesIds.map((id) =>
                papi.tx.Democracy.remove_vote({ index: id }),
              ),
              ...newProcessedVotesIds.map(({ classId, id }) =>
                papi.tx.ConvictionVoting.remove_vote({
                  class: classId,
                  index: id,
                }),
              ),
              ...mainTxs,
            ]

      const stakedAmountHuman = toDecimal(stakeAmount, native.decimals)

      const toasts = {
        submitted: t("gigaStaking.migrate.toasts.submitted", {
          value: stakedAmountHuman,
          symbol: native.symbol,
        }),
        success: t("gigaStaking.migrate.toasts.success", {
          value: stakedAmountHuman,
          symbol: native.symbol,
        }),
      }

      await createBatch({
        txs,
        transaction: {
          invalidateQueries: [
            userGigaBorrowSummaryQueryKey(address),
            stakingPositionsQuery(rpc, address).queryKey,
            HDXSupplyQueryKey,
          ],
          toasts,
        },
      })
    },
  })
}
