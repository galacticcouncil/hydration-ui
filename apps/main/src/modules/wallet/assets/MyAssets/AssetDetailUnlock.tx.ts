import { safeConvertAddressSS58 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { nativeTokenLocksQuery } from "@/api/balances"
import { openGovUnlockedTokensQueryKey } from "@/api/democracy"
import { gigaQueryKey } from "@/api/gigaStake"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useUnlockNativeLocks = (
  votesToRemove: ReadonlyArray<{ voteId: number; classId: number }>,
  pendingPositions: ReadonlyArray<{ voteAtBlock: number; amount: bigint }>,
  classIds: ReadonlyArray<number>,
  value: string,
) => {
  const { t } = useTranslation("wallet")
  const rpcProvider = useRpcProvider()
  const { papi } = rpcProvider
  const { account } = useAccount()
  const { native } = useAssets()
  const createBatch = useCreateBatchTx()

  return useMutation({
    mutationFn: async () => {
      const accountAddress = account?.address ?? ""
      if (!accountAddress) {
        throw new Error("No account connected")
      }

      const txs = votesToRemove.map((vote) =>
        papi.tx.ConvictionVoting.remove_vote({
          class: vote.classId,
          index: vote.voteId,
        }),
      )

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpcProvider.papiClient.getUnsafeApi() as any
      const pendingPositionsTxs = pendingPositions.map((position) =>
        unsafeApi.tx.GigaHdx.unlock({
          position_id: position.voteAtBlock,
        }),
      )

      if (!txs.length && !classIds.length) {
        return null
      }

      const target = safeConvertAddressSS58(accountAddress)

      const batchTx = [
        ...txs,
        ...pendingPositionsTxs,
        ...classIds.map((id) =>
          papi.tx.ConvictionVoting.unlock({ target, class: id }),
        ),
      ]

      const type = new Big(value).eq(0) ? "clear" : "unlock"
      const amount = votesToRemove.length

      const toasts = {
        submitted: t(`myAssets.expandedNative.${type}.onLoading`, {
          amount,
          value,
          symbol: native.symbol,
        }),
        success: t(`myAssets.expandedNative.${type}.onSuccess`, {
          amount,
          value,
          symbol: native.symbol,
        }),
      }

      const invalidateQueries =
        pendingPositionsTxs.length > 0
          ? [
              gigaQueryKey(accountAddress),
              openGovUnlockedTokensQueryKey(accountAddress),
              nativeTokenLocksQuery(rpcProvider, accountAddress).queryKey,
            ]
          : [
              nativeTokenLocksQuery(rpcProvider, accountAddress).queryKey,
              openGovUnlockedTokensQueryKey(accountAddress),
            ]

      return await createBatch({
        txs: batchTx,
        transaction: {
          toasts,
          invalidateQueries,
        },
      })
    },
  })
}
