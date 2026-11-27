import { type Terms, type XcIntentsClient } from "@galacticcouncil/xc-intents"
import { Binary, type SizedHex } from "polkadot-api"
import { type Hex } from "viem"

import { type Papi } from "@/api/rpcClient"

export type XcTwapCloseCall = {
  readonly from: Hex
  readonly to: Hex
  readonly data: Hex
  readonly value: bigint
}

export type XcTwapCloseGas = {
  readonly gasLimit: bigint
  readonly gasPrice: bigint
}

/**
 * Closes the terms and removes the intent in one transaction.
 * Not `transformEvmCallToPapiTx`: it hard-codes `value: 0`, and the close
 * pays the Wormhole fee. `dispatch_evm_call` fails the batch on a revert.
 */
export const buildXcTwapCancelTx = async (
  papi: Papi,
  client: XcIntentsClient,
  {
    owner,
    terms,
    intentId,
    gas,
  }: {
    readonly owner: Hex
    readonly terms: Terms
    readonly intentId: bigint
    readonly gas: (call: XcTwapCloseCall) => Promise<XcTwapCloseGas>
  },
) => {
  const [close] = await client.closeCalls(terms)
  if (!close) throw new Error("xc-intents returned no close call")

  const call: XcTwapCloseCall = {
    from: owner,
    to: close.to,
    data: close.data as Hex,
    value: close.value ?? 0n,
  }
  const { gasLimit, gasPrice } = await gas(call)

  const evmCall = papi.tx.EVM.call({
    source: owner as SizedHex<20>,
    target: call.to as SizedHex<20>,
    input: Binary.fromHex(call.data),
    value: [call.value, 0n, 0n, 0n],
    gas_limit: gasLimit,
    max_fee_per_gas: [gasPrice, 0n, 0n, 0n],
    max_priority_fee_per_gas: [gasPrice, 0n, 0n, 0n],
    access_list: [],
    authorization_list: [],
    nonce: undefined,
  })

  return papi.tx.Utility.batch_all({
    calls: [
      papi.tx.Dispatcher.dispatch_evm_call({ call: evmCall.decodedCall })
        .decodedCall,
      papi.tx.Intent.remove_intent({ id: intentId }).decodedCall,
    ],
  })
}
