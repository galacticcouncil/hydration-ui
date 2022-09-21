import { useApiPromise } from "../utils/network"
import { useStore } from "../state/store"
import { useCallback, useState } from "react"
import BigNumber from "bignumber.js"
import { u32 } from "@polkadot/types"
import { usePaymentInfo } from "./transaction"

interface AddLiquidityAsset {
  id: string
  amount: BigNumber
}

export function useAddLiquidity(assetA: string, assetB: string) {
  const api = useApiPromise()
  const { account, createTransaction } = useStore()
  const [pendingTx, setPendingTx] = useState(false)

  const { data: paymentInfoData } = usePaymentInfo(
    api.tx.xyk.addLiquidity(assetA, assetB, "0", "0"),
    account?.address,
  )

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
    paymentInfo: paymentInfoData,
    pendingTx,
  }
}
