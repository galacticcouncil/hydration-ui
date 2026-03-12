import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { queryOptions } from "@tanstack/react-query"

import { TProviderContext } from "@/providers/rpcProvider"

export const intentsByAccountQuery = (
  context: TProviderContext,
  address: string,
) => {
  const { papiNext, isApiLoaded } = context

  return queryOptions({
    enabled: isApiLoaded && !!address,
    refetchInterval: 30_000,
    queryKey: ["intents", "byAccount", address],
    queryFn: async () => {
      const ownerEntries = await papiNext.query.Intent.IntentOwner.getEntries({
        at: "best",
      })

      const accountPublicKey = safeConvertSS58toPublicKey(address)

      const myIntentIds = ownerEntries
        .filter(
          (entry) =>
            safeConvertSS58toPublicKey(entry.value) === accountPublicKey,
        )
        .map((entry) => entry.keyArgs[0])

      if (myIntentIds.length === 0) return []

      const results = await Promise.all(
        myIntentIds.map(async (id) => {
          const intent = await papiNext.query.Intent.Intents.getValue(id, {
            at: "best",
          })
          return intent ? { id, intent } : null
        }),
      )

      return results.filter((r) => r !== null)
    },
  })
}
