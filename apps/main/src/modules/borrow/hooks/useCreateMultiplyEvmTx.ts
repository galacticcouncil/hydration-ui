import { HexString } from "@galacticcouncil/utils"
import { CallType } from "@galacticcouncil/xc-core"
import { useQuery } from "@tanstack/react-query"
import { useCallback } from "react"

import { evmGasPriceQuery } from "@/api/evm"
import { transformEvmCallToPapiTx } from "@/modules/transactions/utils/tx"
import { useRpcProvider } from "@/providers/rpcProvider"

const MULTIPLY_GAS_LIMIT = 1000000n

export const useCreateMultiplyEvmTx = () => {
  const rpc = useRpcProvider()
  const { papi } = rpc

  const { data: gasPrice } = useQuery(evmGasPriceQuery(rpc))

  return useCallback(
    (tx: { from: string; to: string; data: string }) =>
      transformEvmCallToPapiTx(papi, {
        type: CallType.Evm,
        from: tx.from,
        to: tx.to as HexString,
        data: tx.data,
        gasLimit: MULTIPLY_GAS_LIMIT,
        maxFeePerGas: gasPrice ?? 0n,
        maxPriorityFeePerGas: gasPrice ?? 0n,
        dryRun: async () => Promise.resolve(undefined),
      }),
    [papi, gasPrice],
  )
}
