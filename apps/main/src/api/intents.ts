/* eslint-disable @typescript-eslint/no-explicit-any */
import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { queryOptions } from "@tanstack/react-query"

import { TProviderContext } from "@/providers/rpcProvider"

export const intentsByAccountQuery = (
  context: TProviderContext,
  address: string,
) => {
  const { papiClient, isApiLoaded } = context

  return queryOptions({
    enabled: isApiLoaded && !!address,
    refetchInterval: 30_000,
    queryKey: ["intents", "byAccount", address],
    queryFn: async () => {
      // Use unsafe API to bypass descriptor checksum validation
      // (Intent pallet descriptors may not match the runtime version)
      const unsafeApi = papiClient.getUnsafeApi() as any

      // TODO: switch to Intent.AccountIntents.getEntries(address) once
      // the new runtime (PR #1360) is deployed — it's a direct reverse index
      // and avoids this full scan.
      let ownerEntries: any[]
      try {
        ownerEntries = await unsafeApi.query.Intent.IntentOwner.getEntries({
          at: "best",
        })
      } catch {
        // Intent pallet not available on this chain
        return []
      }

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
          const intent = await unsafeApi.query.Intent.Intents.getValue(id, {
            at: "best",
          })
          return intent ? { id, intent } : null
        }),
      )

      return results.filter((r: any) => r !== null)
    },
  })
}
