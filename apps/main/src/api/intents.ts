/* eslint-disable @typescript-eslint/no-explicit-any */
import { queryOptions } from "@tanstack/react-query"

import { TProviderContext } from "@/providers/rpcProvider"

export const iceFeeQuery = (context: TProviderContext) => {
  const { papiClient, isApiLoaded } = context

  return queryOptions({
    enabled: isApiLoaded,
    staleTime: Infinity,
    queryKey: ["iceFee"],
    queryFn: async () => {
      const unsafeApi = papiClient.getUnsafeApi() as any
      try {
        // Permill: parts per million (e.g. 200 = 0.02%)
        const raw = unsafeApi.constants.ICE.Fee
        const fee =
          typeof raw === "object" ? Number(raw.value ?? raw) : Number(raw)
        if (!isNaN(fee) && fee > 0) return fee
      } catch (e) {
        console.warn("[iceFee] ICE.Fee constant not available:", e)
      }
      // Fallback: 200 Permill = 0.02% (matches runtime config)
      return 200
    },
  })
}

/**
 * Runtime constant `Intent.MaxAllowedIntentDuration` — maximum
 * `deadline - now` window in milliseconds that a Swap intent may have.
 * Exceeding it (or sitting exactly at the boundary when the runtime's
 * comparison is strict) causes the extrinsic to fail with
 * `Intent: InvalidDeadline`. Cached indefinitely: changes only on
 * runtime upgrade.
 */
export const maxIntentDurationQuery = (context: TProviderContext) => {
  const { papiClient, isApiLoaded } = context

  return queryOptions({
    enabled: isApiLoaded,
    staleTime: Infinity,
    queryKey: ["maxIntentDuration"],
    queryFn: async () => {
      const unsafeApi = papiClient.getUnsafeApi() as any
      try {
        const raw = unsafeApi.constants.Intent.MaxAllowedIntentDuration
        // The PAPI descriptor types it as `bigint`. Some unsafeApi
        // wrappers return `{ value: bigint }` — handle both.
        const ms =
          typeof raw === "bigint"
            ? raw
            : typeof raw?.value === "bigint"
              ? raw.value
              : typeof raw === "number"
                ? BigInt(raw)
                : null
        if (ms !== null && ms > 0n) return ms
      } catch (e) {
        console.warn(
          "[maxIntentDuration] Intent.MaxAllowedIntentDuration not available:",
          e,
        )
      }
      // Fallback: 24h (matches feat/ice-pallet runtime default).
      return BigInt(24 * 60 * 60 * 1000)
    },
  })
}

export type IntentSwapData = {
  asset_in: number
  asset_out: number
  amount_in: bigint
  amount_out: bigint
  partial: { type: "Yes"; value: bigint } | { type: "No" }
}

export type IntentDcaData = {
  asset_in: number
  asset_out: number
  /** Per-trade input (native units). */
  amount_in: bigint
  /** Per-trade expected output (native units). */
  amount_out: bigint
  /** Permill (parts per million). 10_000 = 1%. */
  slippage: number
  /**
   * Total budget cap in native units. `undefined` means "rolling / no
   * cap" — the intent runs until the account balance is depleted or
   * until the intent is cancelled.
   */
  budget?: bigint
  /** Blocks between executions. */
  period: number
}

export type IntentData = {
  data:
    | { type: "Swap"; value: IntentSwapData }
    | { type: "Dca"; value: IntentDcaData }
  deadline?: bigint
  on_resolved?: unknown
}

export type AccountIntent = {
  id: bigint
  intent: IntentData
}

export const intentsByAccountQuery = (
  context: TProviderContext,
  address: string,
) => {
  const { papiClient, isApiLoaded } = context

  return queryOptions({
    enabled: isApiLoaded && !!address,
    refetchInterval: 30_000,
    queryKey: ["intents", "byAccount", address],
    queryFn: async (): Promise<AccountIntent[]> => {
      const unsafeApi = papiClient.getUnsafeApi() as any

      // Use the AccountIntents reverse index — keyed by (account, intentId)
      let accountEntries: any[]
      try {
        accountEntries = await unsafeApi.query.Intent.AccountIntents.getEntries(
          address,
          {
            at: "best",
          },
        )
      } catch {
        // Intent pallet not available on this chain
        return []
      }

      const intentIds = accountEntries.map(
        (entry: any) => entry.keyArgs[1] as bigint,
      )

      if (intentIds.length === 0) return []

      const results = await Promise.all(
        intentIds.map(async (id: bigint) => {
          const intent = await unsafeApi.query.Intent.Intents.getValue(id, {
            at: "best",
          })
          return intent ? { id, intent: intent as IntentData } : null
        }),
      )

      return results.filter((r): r is AccountIntent => r !== null)
    },
  })
}
