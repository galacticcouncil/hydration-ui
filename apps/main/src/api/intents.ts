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
      // TODO: switch to Intent.AccountIntents.getEntries(address) once
      // the new runtime (PR #1360) is deployed — it's a direct reverse index
      // and avoids this full scan.
      const ownerEntries = await (papiNext as any).query.Intent.IntentOwner.getEntries({
        at: "best",
      })

      const accountPublicKey = safeConvertSS58toPublicKey(address)

      const myIntentIds = ownerEntries
        .filter(
          (entry: any) =>
            safeConvertSS58toPublicKey(entry.value) === accountPublicKey,
        )
        .map((entry: any) => entry.keyArgs[0])

      if (myIntentIds.length === 0) return []

      const results = await Promise.all(
        myIntentIds.map(async (id: any) => {
          const intent = await (papiNext as any).query.Intent.Intents.getValue(id, {
            at: "best",
          })
          return intent ? { id, intent } : null
        }),
      )

      return results.filter((r: any) => r !== null)
    },
  })
}
