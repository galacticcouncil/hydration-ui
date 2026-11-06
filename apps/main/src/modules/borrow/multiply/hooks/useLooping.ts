import { getReserveAddressByAssetId } from "@galacticcouncil/money-market/utils"
import { stringEquals } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { useBorrowReserves } from "@/api/borrow/queries"
import { useLoopingBatch } from "@/modules/borrow/multiply/hooks/useLoopingBatch"
import { UseLoopingStepsProps } from "@/modules/borrow/multiply/hooks/useLoopingSteps"
import {
  convertBatchToTxs,
  getBatchErrors,
} from "@/modules/borrow/multiply/utils/batch"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { TransactionOptions } from "@/states/transactions"

export function useLooping(
  props: UseLoopingStepsProps,
  options?: TransactionOptions,
) {
  const { t } = useTranslation(["borrow"])
  const { account } = useAccount()
  const rpc = useRpcProvider()
  const { data: reserves } = useBorrowReserves()
  const slippage = useTradeSettings((s) => s.swap.single.swapSlippage)

  const createBatchTx = useCreateBatchTx()

  const { sdk } = rpc
  const { amount, supplyAssetId } = props

  const supplyReserve = reserves?.formattedReserves.find((r) =>
    stringEquals(r.underlyingAsset, getReserveAddressByAssetId(supplyAssetId)),
  )

  const {
    batch,
    targetCollateral,
    targetDebt,
    totalCollateral,
    isLoading: isLoadingBatch,
  } = useLoopingBatch(props)

  const { mutate: submit, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      if (!batch?.length) throw new Error("Invalid looping batch")
      if (!account) throw new Error("Account not connected")
      if (!supplyReserve) throw new Error("Supply reserve not found")

      const txs = await convertBatchToTxs(sdk, batch, account.address, slippage)

      return createBatchTx({
        txs,
        options,
        transaction: {
          invalidateQueries: [["borrow"]],
          toasts: {
            submitted: t("multiply.toast.loop.onLoading", {
              symbol: supplyReserve.symbol,
              value: amount,
            }),
            success: t("multiply.toast.loop.onSuccess", {
              symbol: supplyReserve.symbol,
              value: amount,
            }),
          },
        },
      })
    },
  })

  const isLoading = isLoadingBatch || isSubmitting

  const errors = batch ? getBatchErrors(batch) : []

  return {
    targetCollateral,
    targetDebt,
    totalCollateral,
    isLoading,
    submit,
    errors,
  }
}
