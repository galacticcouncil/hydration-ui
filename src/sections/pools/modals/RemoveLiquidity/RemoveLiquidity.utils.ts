import { useApiPromise } from "../../../../utils/api"
import { useStore } from "../../../../state/store"

export const useRemoveLiquidity = (onSuccess: () => void) => {
  const api = useApiPromise()
  const { createTransaction } = useStore()

  return async (positionId: string, value: string) => {
    const transaction = await createTransaction(
      {
        tx: api.tx.omnipool.removeLiquidity(positionId, value),
      },
      {
        onSuccess,
      },
    )
    if (transaction.isError) return
  }
}
