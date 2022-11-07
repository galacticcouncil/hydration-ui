import { useApiPromise } from "utils/api"
import { useAccountStore, useStore } from "../state/store"
import BigNumber from "bignumber.js"
import { usePaymentInfo } from "./transaction"
import { useMutation } from "@tanstack/react-query"

interface AddLiquidityAsset {
  id: string
  amount: BigNumber
}

export function useAddLiquidity(assetA: string, assetB: string) {
  const api = useApiPromise()
  const { createTransaction } = useStore()
  const { account } = useAccountStore()

  const { data: paymentInfoData } = usePaymentInfo(
    api.tx.xyk.addLiquidity(assetA, assetB, "0", "0"),
  )

  const handleAddLiquidity = useMutation(
    async ([assetA, assetB]: [AddLiquidityAsset, AddLiquidityAsset]) => {
      if (!account) throw new Error("Missing account")
      return await createTransaction({
        tx: api.tx.xyk.addLiquidity(
          assetA.id,
          assetB.id,
          assetA.amount.toFixed(),
          assetB.amount.toFixed(),
        ),
      })
    },
  )

  return {
    handleAddLiquidity,
    paymentInfo: paymentInfoData,
  }
}
