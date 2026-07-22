import { ProtocolAction } from "@aave/contract-helpers"
import { useQuery } from "@tanstack/react-query"
import { PopulatedTransaction } from "ethers"

import { useRootStore } from "@/store/root"
import { ExtendedEvmCall } from "@/types"
import { convertPopulatedTransactionToEvmCall } from "@/utils/convertTx"

type UseWithdrawEstimationTxParams = {
  poolAddress: string
  aTokenAddress: string
  amount: string
  enabled?: boolean
}

export const useWithdrawEstimationTx = ({
  poolAddress,
  aTokenAddress,
  amount,
  enabled = true,
}: UseWithdrawEstimationTxParams) => {
  const [withdraw, estimateGasLimit, account] = useRootStore((store) => [
    store.withdraw,
    store.estimateGasLimit,
    store.account,
  ])

  return useQuery({
    enabled: enabled && !!account && !!amount && !!poolAddress,
    queryKey: ["withdrawEstimationTx", poolAddress, aTokenAddress, amount],
    queryFn: async (): Promise<ExtendedEvmCall> => {
      const txs = await withdraw({
        reserve: poolAddress,
        amount,
        aTokenAddress,
      })

      const withdrawTx = txs.find((tx) => tx.txType === "DLP_ACTION")
      if (!withdrawTx) {
        throw new Error("Withdraw transaction not found")
      }

      let withdrawTxData = (await withdrawTx.tx()) as PopulatedTransaction
      withdrawTxData = await estimateGasLimit(
        withdrawTxData,
        ProtocolAction.withdraw,
      )

      return convertPopulatedTransactionToEvmCall(
        withdrawTxData,
        ProtocolAction.withdraw,
      )
    },
  })
}
