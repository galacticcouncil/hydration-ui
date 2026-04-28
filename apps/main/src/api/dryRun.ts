import { QUERY_KEY_BLOCK_PREFIX, safeStringify } from "@galacticcouncil/utils"
import { queryOptions } from "@tanstack/react-query"

import { decodeTx } from "@/modules/transactions/review/ReviewTransactionJsonView/ReviewTransactionJsonView.utils"
import { AnyPapiTx } from "@/modules/transactions/types"
import { TProviderContext } from "@/providers/rpcProvider"

export const papiDryRunErrorQuery = (
  { papi, dryRunErrorDecoder }: TProviderContext,
  address: string,
  tx: AnyPapiTx,
  debug?: boolean,
) =>
  queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "dryRun",
      "papi",
      address,
      safeStringify(tx.decodedCall),
    ],
    queryFn: async () => {
      try {
        const json = decodeTx(tx)
        const result = await papi.apis.DryRunApi.dry_run_call(
          {
            type: "system",
            value: {
              type: "Signed",
              value: address,
            },
          },
          // @ts-expect-error contains structured call data
          json,
          1,
        )

        if (!result.success || result.value.execution_result.success) {
          return null
        }

        const error = await dryRunErrorDecoder.parseError(
          result.value.execution_result.value.error,
        )

        if (debug && error) {
          console.log(new Date().toLocaleTimeString(), error.name, json)
        }

        return error
      } catch (error) {
        console.error(error)
        return null
      }
    },
  })
