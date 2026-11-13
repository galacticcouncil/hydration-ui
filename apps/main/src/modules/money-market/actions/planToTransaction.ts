import type { ActionPlan } from "@galacticcouncil/money-market/types"
import { safeStringify } from "@galacticcouncil/utils"
import { ExtendedEvmCall } from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xc-core"
import { PublicClient } from "viem"

import { Papi } from "@/api/rpcClient"
import { AnyTransaction } from "@/modules/transactions/types"
import { transformEvmCallToPapiTx } from "@/modules/transactions/utils/tx"

type PlanToTransactionOptions = {
  papi: Papi
  from: string
  feePerGas: bigint
}

/** The live EVM gas price plus a 5% surplus, so a tick of drift can't underpay. */
export const fetchFeePerGas = async (evm: PublicClient): Promise<bigint> => {
  const gasPrice = await evm.getGasPrice()
  return gasPrice + (gasPrice * 5n) / 100n
}

const toNativeEvmCall = (
  call: ActionPlan[number],
  from: string,
  feePerGas: bigint,
): ExtendedEvmCall => ({
  type: CallType.Evm,
  from,
  to: call.to,
  data: call.data,
  abi: safeStringify(call.abi),
  gasLimit: call.gasLimit,
  maxFeePerGas: call.maxFeePerGas ?? feePerGas,
  maxPriorityFeePerGas: call.maxPriorityFeePerGas ?? feePerGas,
  dryRun: () => Promise.resolve(undefined),
})

/**
 * One call is sent as a native EVM call; several become one atomic
 * `Utility.batch_all` of dispatched EVM calls, so a plan never lands half-way.
 */
export const planToTransaction = (
  plan: ActionPlan,
  { papi, from, feePerGas }: PlanToTransactionOptions,
): AnyTransaction => {
  const calls = plan.map((call) => toNativeEvmCall(call, from, feePerGas))
  const [single] = calls

  if (single && calls.length === 1) {
    return single
  }

  return papi.tx.Utility.batch_all({
    calls: calls.map(
      (call) =>
        papi.tx.Dispatcher.dispatch_evm_call({
          call: transformEvmCallToPapiTx(papi, call).decodedCall,
        }).decodedCall,
    ),
  })
}
