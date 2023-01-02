import { useApiPromise } from "../../../../utils/api"
import { useStore } from "../../../../state/store"
import { u128 } from "@polkadot/types-codec"

export const useRemoveLiquidity = () => {
  const api = useApiPromise()
  const { createTransaction } = useStore()

  return async (positionId: u128, value: string) => {
    const transaction = await createTransaction({
      tx: api.tx.omnipool.removeLiquidity(positionId, value),
    })
    if (transaction.isError) return
  }
}
