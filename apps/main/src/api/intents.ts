import { queryOptions, useQuery } from "@tanstack/react-query"
import { isNonNullish } from "remeda"

import {
  PapiIce,
  TProviderContext,
  useRpcProvider,
} from "@/providers/rpcProvider"

type IntentValue = NonNullable<
  Awaited<ReturnType<PapiIce["query"]["Intent"]["Intents"]["getValue"]>>
>

export type AccountIntentEntry = {
  id: bigint
  intent: IntentValue
}

export const intentsByAccountQuery = (
  context: TProviderContext,
  address: string,
) => {
  const { isApiLoaded, papiIce, featureFlags } = context

  return queryOptions({
    enabled: featureFlags.isIceEnabled && isApiLoaded && !!address,
    queryKey: ["intents", "byAccount", address],
    queryFn: async () => {
      const accountEntries =
        await papiIce.query.Intent.AccountIntents.getEntries(address, {
          at: "best",
        })

      const intentIds = accountEntries.map((entry) => entry.keyArgs[1])

      if (!intentIds.length) return []

      const results: Array<AccountIntentEntry | null> = await Promise.all(
        intentIds.map(async (id) => {
          const intent = await papiIce.query.Intent.Intents.getValue(id, {
            at: "best",
          })
          return intent ? { id, intent } : null
        }),
      )

      return results.filter(isNonNullish)
    },
  })
}

export const useAccountIntents = (address: string) => {
  const rpc = useRpcProvider()
  return useQuery(intentsByAccountQuery(rpc, address))
}
