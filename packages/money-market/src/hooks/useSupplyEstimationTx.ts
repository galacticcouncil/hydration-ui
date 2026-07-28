import { ProtocolAction } from "@aave/contract-helpers"
import { useQuery } from "@tanstack/react-query"
import { parseUnits } from "ethers/lib/utils"

import { useRootStore } from "@/store/root"
import { ExtendedEvmCall } from "@/types"
import { convertPopulatedTransactionToEvmCall } from "@/utils/convertTx"

type UseSupplyEstimationTxParams = {
  poolAddress: string
  amount: string
  decimals: number
  enabled?: boolean
}

export const useSupplyEstimationTx = ({
  poolAddress,
  amount,
  decimals,
  enabled = true,
}: UseSupplyEstimationTxParams) => {
  const [supply, estimateGasLimit, account] = useRootStore((store) => [
    store.supply,
    store.estimateGasLimit,
    store.account,
  ])

  return useQuery({
    enabled: enabled && !!account && !!amount && !!poolAddress,
    queryKey: ["supplyEstimationTx", poolAddress, amount],
    queryFn: async (): Promise<ExtendedEvmCall> => {
      let supplyTxData = supply({
        amount: parseUnits(amount, decimals).toString(),
        reserve: poolAddress,
      })
      supplyTxData = await estimateGasLimit(supplyTxData, ProtocolAction.supply)

      return convertPopulatedTransactionToEvmCall(
        supplyTxData,
        ProtocolAction.supply,
      )
    },
  })
}
