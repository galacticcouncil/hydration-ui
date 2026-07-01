import { InterestRate, ProtocolAction } from "@aave/contract-helpers"
import { useQuery } from "@tanstack/react-query"
import { parseUnits } from "ethers/lib/utils"

import { useRootStore } from "@/store/root"
import { ExtendedEvmCall } from "@/types"
import { convertPopulatedTransactionToEvmCall } from "@/utils/convertTx"

type UseRepayEstimationTxParams = {
  poolAddress: string
  debtType: InterestRate
  repayWithATokens: boolean
  amount: string
  decimals: number
  enabled?: boolean
}

export const useRepayEstimationTx = ({
  poolAddress,
  debtType,
  repayWithATokens,
  amount,
  decimals,
  enabled = true,
}: UseRepayEstimationTxParams) => {
  const [repay, encodeRepayParams, estimateGasLimit, optimizedPath, account] =
    useRootStore((store) => [
      store.repay,
      store.encodeRepayParams,
      store.estimateGasLimit,
      store.useOptimizedPath,
      store.account,
    ])

  return useQuery({
    enabled: enabled && !!account && !!amount && !!poolAddress,
    queryKey: [
      "repayEstimationTx",
      poolAddress,
      debtType,
      repayWithATokens,
      amount,
    ],
    queryFn: async (): Promise<ExtendedEvmCall> => {
      const repayParams = {
        amountToRepay: parseUnits(amount, decimals).toString(),
        poolAddress,
        repayWithATokens,
        debtType,
      }

      let encodedParams: string | undefined
      if (optimizedPath()) {
        encodedParams = await encodeRepayParams(repayParams)
      }

      let repayTxData = repay({
        ...repayParams,
        encodedTxData: encodedParams,
      })
      repayTxData = await estimateGasLimit(repayTxData, ProtocolAction.repay)

      return convertPopulatedTransactionToEvmCall(
        repayTxData,
        ProtocolAction.repay,
      )
    },
  })
}
