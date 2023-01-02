import { useApiPromise } from "../../../../utils/api"
import { useStore } from "../../../../state/store"

export const useRemoveLiquidity = () => {
  const api = useApiPromise()
  const { createTransaction } = useStore()

  return async (positionId: string, value: string) => {
    const transaction = await createTransaction({
      tx: api.tx.omnipool.removeLiquidity(positionId, value),
    })
    if (transaction.isError) return
  }
}
