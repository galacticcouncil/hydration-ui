import { useMutation } from "@tanstack/react-query"
import { DepositNftType } from "api/deposits"
import { useStore } from "state/store"
import { useApiPromise } from "utils/api"

export const useFarmExitAllMutation = (depositNfts: DepositNftType[]) => {
  const api = useApiPromise()
  const { createTransaction } = useStore()

  return useMutation(async () => {
    const txs =
      depositNfts
        ?.map((record) => {
          return record.deposit.yieldFarmEntries.map((entry) => {
            return api.tx.omnipoolLiquidityMining.withdrawShares(
              record.id,
              entry.yieldFarmId,
            )
          })
        })
        .flat(2) ?? []

    if (txs.length > 1) {
      return await createTransaction({ tx: api.tx.utility.batchAll(txs) })
    } else {
      return await createTransaction({ tx: txs[0] })
    }
  })
}
