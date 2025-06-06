import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import { PermitResult } from "@galacticcouncil/web3-connect/src/signers/EthereumSigner"
import { Binary } from "polkadot-api"

import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import { isEvmCall } from "@/modules/transactions/utils/xcm"
import { Papi } from "@/providers/rpcProvider"
import { AnyPapiTx, AnyTransaction } from "@/states/transactions"

export const transformPermitToPapiTx = (
  papi: Papi,
  permit: PermitResult,
): AnyPapiTx => {
  return papi.tx.MultiTransactionPayment.dispatch_permit({
    data: Binary.fromHex(permit.message.data),
    from: Binary.fromHex(permit.message.from),
    to: Binary.fromHex(permit.message.to),
    value: [BigInt(permit.message.value), 0n, 0n, 0n],
    gas_limit: BigInt(permit.message.gaslimit),
    deadline: [BigInt(permit.message.deadline), 0n, 0n, 0n],
    v: Number(permit.signature.v),
    r: Binary.fromHex(permit.signature.r),
    s: Binary.fromHex(permit.signature.s),
  })
}

export const transformEvmCallToPapiTx = (
  papi: Papi,
  tx: ExtendedEvmCall,
): AnyPapiTx =>
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

export const transformAnyToPapiTx = (
  papi: Papi,
  tx: AnyTransaction,
): AnyPapiTx | null => {
  if (isPapiTransaction(tx)) {
    return tx
  }

  if (isEvmCall(tx)) {
    return transformEvmCallToPapiTx(papi, tx)
  }

  return null
}
