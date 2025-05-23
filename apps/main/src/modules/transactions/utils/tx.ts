import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import { Binary } from "polkadot-api"

import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import { isEvmCall } from "@/modules/transactions/utils/xcm"
import { Papi } from "@/providers/rpcProvider"
import { AnyTransaction } from "@/states/transactions"

export const transformEvmCallToPapiTx = (papi: Papi, tx: ExtendedEvmCall) =>
  papi.tx.EVM.call({
    source: Binary.fromHex(tx.from),
    target: Binary.fromHex(tx.to),
    input: Binary.fromHex(tx.data),
    value: [0n, 0n, 0n, 0n],
    gas_limit: tx.gasLimit || 0n,
    max_fee_per_gas: [tx.maxFeePerGas || 0n, 0n, 0n, 0n],
    max_priority_fee_per_gas: [tx.maxPriorityFeePerGas || 0n, 0n, 0n, 0n],
    access_list: [],
    nonce: undefined,
  })

export const transformAnyToPapiTx = (papi: Papi, tx: AnyTransaction) => {
  if (isPapiTransaction(tx)) {
    return tx
  }

  if (isEvmCall(tx)) {
    return transformEvmCallToPapiTx(papi, tx)
  }

  return null
}
