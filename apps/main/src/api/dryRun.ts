import { DryRunErrorDecoder } from "@galacticcouncil/utils"

import { decodeTx } from "@/modules/transactions/review/ReviewTransactionJsonView/ReviewTransactionJsonView.utils"
import { AnyPapiTx } from "@/modules/transactions/types"
import { Papi } from "@/providers/rpcProvider"

export const getPapiDryRunError = async (
  papi: Papi,
  dryRunErrorDecoder: DryRunErrorDecoder,
  address: string,
  tx: AnyPapiTx,
) => {
  try {
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
      1,
    )

    return !result.success || result.value.execution_result.success
      ? null
      : await dryRunErrorDecoder.parseError(
          result.value.execution_result.value.error,
        )
  } catch (error) {
    console.error(error)
    return null
  }
}
