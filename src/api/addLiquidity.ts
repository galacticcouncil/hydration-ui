import { useApiPromise } from "../utils/network"
import { useAccountStore, useStore } from "../state/store"
import { useCallback, useState } from "react"
import BigNumber from "bignumber.js"
import { usePaymentInfo } from "./transaction"

interface AddLiquidityAsset {
  id: string
  amount: BigNumber
}

export function useAddLiquidity(assetA: string, assetB: string) {
  const api = useApiPromise()
  const { createTransaction } = useStore()
  const { account } = useAccountStore()

  const [pendingTx, setPendingTx] = useState(false)

  const { data: paymentInfoData } = usePaymentInfo(
    api.tx.xyk.addLiquidity(assetA, assetB, "0", "0"),
  )

  const handleAddLiquidity = useCallback(
    async ([assetA, assetB]: [AddLiquidityAsset, AddLiquidityAsset]) => {
      if (account) {
        try {
          setPendingTx(true)

          await createTransaction({
            tx: api.tx.xyk.addLiquidity(
              assetA.id,
              assetB.id,
              assetA.amount.toFixed(),
              assetB.amount.toFixed(),
            ),
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
    paymentInfo: paymentInfoData,
    pendingTx,
  }
}
