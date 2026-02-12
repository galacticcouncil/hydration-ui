import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import { parseDryRunError } from "@galacticcouncil/utils/src/helpers/meta"
import { Binary } from "polkadot-api"

import { decodeTx } from "@/modules/transactions/review/ReviewTransactionJsonView/ReviewTransactionJsonView.utils"
import { AnyPapiTx } from "@/modules/transactions/types"
import { Papi } from "@/providers/rpcProvider"

export const getPapiDryRunError = async (
  papi: Papi,
  address: string,
  tx: AnyPapiTx,
) => {
  const result = await papi.apis.DryRunApi.dry_run_call(
    {
      type: "system",
      value: {
        type: "Signed",
        value: address,
      },
    },
    // @ts-expect-error contains structured call data
    decodeTx(tx),
  )

  return !result.success || result.value.execution_result.success
    ? null
    : await parseDryRunError(result.value.execution_result.value.error)
}

export const getEvmDryRunError = async (papi: Papi, tx: ExtendedEvmCall) => {
  return await papi.apis.EthereumRuntimeRPCApi.call(
    Binary.fromHex(tx.from),
    Binary.fromHex(tx.to),
    Binary.fromHex(tx.data),
    [tx.value ?? 0n, 0n, 0n, 0n],
    [tx.gasLimit ?? 0n, 0n, 0n, 0n],
    [tx.maxFeePerGas ?? 0n, 0n, 0n, 0n],
    [tx.maxPriorityFeePerGas ?? 0n, 0n, 0n, 0n],
    [tx.nonce ?? 0n, 0n, 0n, 0n],
    false,
    [],
  )
}
