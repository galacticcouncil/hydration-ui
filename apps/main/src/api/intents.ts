import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { usePapiEntries } from "@/hooks/usePapiEntries"
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

// AccountIntents is a presence index (value is null). Subscribe so rows drop
// when the chain removes an intent; a one-shot refetch on tx inclusion lags.
const useAccountIntentIds = (address: string) => {
  const { isApiLoaded, featureFlags } = useRpcProvider()

  const { data, isLoading } = usePapiEntries(
    "Intent.AccountIntents",
    [address],
    { enabled: featureFlags.isIceEnabled && isApiLoaded && !!address },
  )

  const ids = useMemo(
    () => (data ?? []).map(({ keyArgs }) => keyArgs[1]),
    [data],
  )

  return { ids, isLoading }
}

export const useAccountIntents = (address: string) => {
  const { papiIce } = useRpcProvider()
  const { ids, isLoading: isIdsLoading } = useAccountIntentIds(address)

  // Key values by id; the id list can change while getValues is in flight.
  const { data: pairs, isLoading: isValuesLoading } = useQuery({
    queryKey: ["intents", "values", ids.map(String)],
    enabled: ids.length > 0,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const values = await papiIce.query.Intent.Intents.getValues(
        ids.map((id) => [id] as const),
        { at: "best" },
      )

      return ids.map((id, index): [bigint, IntentValue | null] => [
        id,
        values[index] ?? null,
      ])
    },
  })

  const data = useMemo<Array<AccountIntentEntry>>(() => {
    const byId = new Map(pairs ?? [])

    return ids.flatMap((id) => {
      const intent = byId.get(id)
      return intent ? [{ id, intent }] : []
    })
  }, [ids, pairs])

  return {
    data,
    isLoading: isIdsLoading || (ids.length > 0 && isValuesLoading),
  }
}

export const maxIntentDurationQuery = (context: TProviderContext) => {
  const { papiClient, isApiLoaded, featureFlags } = context

  return queryOptions({
    enabled: featureFlags.isIceEnabled && isApiLoaded,
    staleTime: Infinity,
    queryKey: ["intents", "maxAllowedIntentDuration"],
    queryFn: async () => {
      // @TODO: Add constants.Intent to the descriptors whitelist
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = papiClient.getUnsafeApi() as any
      const maxIntentDuration =
        await unsafeApi.constants.Intent.MaxAllowedIntentDuration()
      return Number(maxIntentDuration - 60_000n) // safety margin of 60 seconds
    },
  })
}
