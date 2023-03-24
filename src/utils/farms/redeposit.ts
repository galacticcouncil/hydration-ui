import { useMutation } from "@tanstack/react-query"
import { DepositNftType } from "api/deposits"
import { Farm } from "api/farms"
import { ToastMessage, useStore } from "state/store"
import { useApiPromise } from "utils/api"

export type FarmRedepositMutationType = ReturnType<
  typeof useFarmRedepositMutation
>

export const useFarmRedepositMutation = (
  availableYieldFarms: Farm[] | undefined,
  depositNfts: DepositNftType[],
  toast: ToastMessage,
) => {
  const api = useApiPromise()
  const { createTransaction } = useStore()

  return useMutation(async () => {
    if (!availableYieldFarms?.length)
      throw new Error("No available farms to redeposit into")

    const txs = depositNfts
      .map((record) => {
        return availableYieldFarms.map((farm) => {
          return api.tx.omnipoolLiquidityMining.redepositShares(
            farm.globalFarm.id,
            farm.yieldFarm.id,
            record.id,
          )
        })
      })
      .flat(2)

    if (txs.length > 1) {
      await createTransaction({ tx: api.tx.utility.batchAll(txs) }, { toast })
    } else {
      await createTransaction({ tx: txs[0] }, { toast })
    }
  })
}
