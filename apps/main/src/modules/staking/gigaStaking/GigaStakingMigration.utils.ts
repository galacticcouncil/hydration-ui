import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { userGigaBorrowSummaryQueryKey } from "@/api/borrow"
import { openGovUnlockedTokensQuery } from "@/api/democracy"
import { evmAccountBindingQuery } from "@/api/evm"
import { useProxyUrl } from "@/api/provider"
import { HDXSupplyQueryKey, stakingPositionsQuery } from "@/api/staking"
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
  const indexerUrl = useProxyUrl()

  return useMutation({
    mutationFn: async (stakeAmount: string) => {
      if (!account) throw new Error("No account connected")

      const { address } = account
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const [isBound, openGovUnlocked] = await Promise.all([
        rpc.queryClient.ensureQueryData(evmAccountBindingQuery(rpc, address)),
        rpc.queryClient.ensureQueryData(
          openGovUnlockedTokensQuery(rpc, address, indexerUrl),
        ),
      ])

      const removeVotesTxs = openGovUnlocked.votesToRemove.map((vote) =>
        papi.tx.ConvictionVoting.remove_vote({
          class: vote.classId,
          index: vote.voteId,
        }),
      )

      const migrateTx = unsafeApi.tx.GigaHdx.migrate()

      const mainTxs = !isBound
        ? [papi.tx.EVMAccounts.bind_evm_address(), migrateTx]
        : [migrateTx]

      const txs = !removeVotesTxs.length
        ? mainTxs
        : [...removeVotesTxs, ...mainTxs]

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
