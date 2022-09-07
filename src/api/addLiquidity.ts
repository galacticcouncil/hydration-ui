import { useApiPromise } from "../utils/network"
import { useStore } from "../state/store"
import { useCallback, useState } from "react"
import BigNumber from "bignumber.js"

interface AddLiquidityAsset {
  id: string
  amount: BigNumber
}

export function useAddLiquidity() {
  const api = useApiPromise()
  const { account, createTransaction } = useStore()
  const [pendingTx, setPendingTx] = useState(false)

  const handleAddLiquidity = useCallback(
    async ([assetA, assetB]: [AddLiquidityAsset, AddLiquidityAsset]) => {
      if (account) {
        try {
          setPendingTx(true)

          const tx = api.tx.xyk.addLiquidity(
            assetA.id,
            assetB.id,
            assetA.amount.toFixed(),
            assetB.amount.toFixed(),
          )

          createTransaction({
            hash: tx.hash.toString(),
            tx,
          })

          setPendingTx(false)
        } catch (err) {
          console.log(err)
          setPendingTx(false)
        }
      }
    },
    [createTransaction, account, api],
  )

  return {
    handleAddLiquidity,
    pendingTx,
  }
}
