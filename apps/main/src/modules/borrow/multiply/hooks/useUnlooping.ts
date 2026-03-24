import { getReserveAddressByAssetId } from "@galacticcouncil/money-market/utils"
import { stringEquals } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { useBorrowReserves } from "@/api/borrow/queries"
import { useUnloopingBatch } from "@/modules/borrow/multiply/hooks/useUnloopingBatch"
import { UseUnloopingStepsProps } from "@/modules/borrow/multiply/hooks/useUnloopingSteps"
import {
  convertBatchToTxs,
  getBatchErrors,
} from "@/modules/borrow/multiply/utils/batch"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { TransactionOptions } from "@/states/transactions"

export function useUnlooping(
  props: UseUnloopingStepsProps,
  options?: TransactionOptions,
) {
  const { t } = useTranslation(["borrow"])
  const { account } = useAccount()
  const rpc = useRpcProvider()
  const { data: reserves } = useBorrowReserves()
  const slippage = useTradeSettings((s) => s.swap.single.swapSlippage)

  const createBatchTx = useCreateBatchTx()

  const { sdk } = rpc
  const { repayAmount, borrowAssetId } = props

  const borrowReserve = reserves?.formattedReserves.find((r) =>
    stringEquals(r.underlyingAsset, getReserveAddressByAssetId(borrowAssetId)),
  )

  const {
    batch,
    remainingCollateral,
    remainingDebt,
    totalRepaid,
    totalWithdrawn,
    isLoading: isLoadingBatch,
  } = useUnloopingBatch(props)

  const { mutate: submit, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      if (!batch?.length) throw new Error("Invalid unlooping batch")
      if (!account) throw new Error("Account not connected")
      if (!borrowReserve) throw new Error("Borrow reserve not found")

      const txs = await convertBatchToTxs(sdk, batch, account.address, slippage)

      return createBatchTx({
        txs,
        options,
        transaction: {
          invalidateQueries: [["borrow"]],
          toasts: {
            submitted: t("multiply.toast.unloop.onLoading", {
              symbol: borrowReserve.symbol,
              value: repayAmount,
            }),
            success: t("multiply.toast.unloop.onSuccess", {
              symbol: borrowReserve.symbol,
              value: repayAmount,
            }),
          },
        },
      })
    },
  })

  const isLoading = isLoadingBatch || isSubmitting

  const errors = batch ? getBatchErrors(batch) : []

  return {
    remainingCollateral,
    remainingDebt,
    totalRepaid,
    totalWithdrawn,
    isLoading,
    submit,
    errors,
  }
}
