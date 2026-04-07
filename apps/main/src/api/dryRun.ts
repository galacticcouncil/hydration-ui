import { queryOptions } from "@tanstack/react-query"
import { Enum } from "polkadot-api"

import { decodeTx } from "@/modules/transactions/review/ReviewTransactionJsonView/ReviewTransactionJsonView.utils"
import { AnyTransaction } from "@/modules/transactions/types"
import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import { getPapiTransactionCallData } from "@/modules/transactions/utils/tx"
import { TProviderContext } from "@/providers/rpcProvider"

export const papiDryRunErrorQuery = (
  { papi, dryRunErrorDecoder, papiCompatibilityToken }: TProviderContext,
  address: string,
  tx: AnyTransaction,
  debug?: boolean,
) =>
  queryOptions({
    queryKey: [
      "dryRun",
      "papi",
      address,
      getPapiTransactionCallData(tx, papiCompatibilityToken),
    ],
    queryFn: async () => {
      try {
        if (!isPapiTransaction(tx)) {
          return null
        }

        const rawOrigin = Enum("Signed", address)
        const origin = Enum("system", rawOrigin)

        const result = await papi.apis.DryRunApi.dry_run_call(
          origin,
          // @ts-expect-error contains structured call data
          tx.decodedCall,
          1,
        )
        console.log(result)
        if (!result.success || result.value.execution_result.success) {
          return null
        }

        const error = await dryRunErrorDecoder.parseError(
          result.value.execution_result.value.error,
        )

        const json = decodeTx(tx)

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
