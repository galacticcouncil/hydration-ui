import { useMutation } from "@tanstack/react-query"
import { ToastMessage, useStore } from "state/store"
import { useRpcProvider } from "providers/rpcProvider"
import { useAssets } from "providers/assets"
import { TDeposit, useRefetchAccountAssets } from "api/deposits"
import { useCreateBatchTx } from "sections/transaction/ReviewTransaction.utils"

export const useFarmExitAllMutation = (
  depositNfts: TDeposit[],
  poolId: string,
  toast: ToastMessage,
  onClose?: () => void,
) => {
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()
  const { getAssetWithFallback, isShareToken } = useAssets()
  const refetch = useRefetchAccountAssets()
  const { createBatch } = useCreateBatchTx()

  const meta = getAssetWithFallback(poolId)
  const isXYK = isShareToken(meta)

  return useMutation(
    async () => {
      const txs =
        depositNfts
          ?.map((record) => {
            return record.data.yieldFarmEntries.map((entry) => {
              return isXYK
                ? api.tx.xykLiquidityMining.withdrawShares(
                    record.id,
                    entry.yieldFarmId,
                    { assetIn: meta.assets[0].id, assetOut: meta.assets[1].id },
                  )
                : api.tx.omnipoolLiquidityMining.withdrawShares(
                    record.id,
                    entry.yieldFarmId,
                  )
            })
          })
          .flat(2) ?? []

      if (txs.length > 1) {
        return await createBatch(txs, {}, { toast, onClose, onBack: () => {} })
      } else {
        return await createTransaction(
          { tx: txs[0] },
          { toast, onClose, onBack: () => {} },
        )
      }
    },
    {
      onSuccess: () => {
        refetch()
      },
    },
  )
}
