import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useRef } from "react"
import { useTranslation } from "react-i18next"

import { MAX_WITHDRAW_ALL_QUERY_KEY } from "@/api/balances"
import { useObservable } from "@/hooks/useObservable"
import {
  IntentOutcome,
  watchIntentOutcomes,
} from "@/modules/transactions/utils/toasts/intentOutcomes"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useHasIntentPallet } from "@/states/intents"
import { ToastData, TransactionToastData, useToasts } from "@/states/toasts"
import { TransactionIntentMeta, TransactionType } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

const STORAGE_CHECK_INTERVAL_MS = 30_000

type TrackedIntent = {
  readonly toastId: string
  readonly intentId: string
  readonly intent: TransactionIntentMeta
}

const getTrackedIntents = (
  toasts: ReadonlyArray<TransactionToastData>,
): TrackedIntent[] =>
  toasts.flatMap(({ id, variant, meta }) =>
    variant === "submitted" &&
    meta.type === TransactionType.Onchain &&
    meta.intent?.id
      ? [
          {
            toastId: id,
            intentId: meta.intent.id,
            intent: meta.intent,
          },
        ]
      : [],
  )

/**
 * Resolves `submitted` ICE intent toasts from papi: live from the Intent
 * events of each new best block, and from best-block storage for intents that
 * resolved while no one was listening (page closed, skipped block). Those end
 * as `unknown`, since storage no longer says how they ended.
 */
export const useIntentToasts = (
  toasts: ReadonlyArray<TransactionToastData>,
) => {
  const { t } = useTranslation(["common", "trade"])
  const { papi, papiClient, isReady } = useRpcProvider()
  const hasIntentPallet = useHasIntentPallet()
  const { edit } = useToasts()
  const queryClient = useQueryClient()
  const { getAssetWithFallback } = useAssets()

  const tracked = getTrackedIntents(toasts)
  const enabled = isReady && hasIntentPallet && tracked.length > 0

  const getToastUpdate = (
    intent: TransactionIntentMeta,
    outcome: IntentOutcome,
  ): Partial<ToastData> => {
    const dateCreated = new Date().toISOString()
    const assetIn = getAssetWithFallback(intent.assetIn)
    const assetOut = getAssetWithFallback(intent.assetOut)
    const formatIn = (value: bigint | string) =>
      t("currency", {
        value: scaleHuman(value, assetIn.decimals),
        symbol: assetIn.symbol,
      })
    const formatOut = (value: bigint | string) =>
      t("currency", {
        value: scaleHuman(value, assetOut.decimals),
        symbol: assetOut.symbol,
      })

    if (outcome.kind === "unfilled") {
      return {
        variant: "warning",
        title: t("trade:intent.market.unfilled", {
          in: formatIn(intent.amountIn),
          out: formatOut(intent.minAmountOut),
        }),
        dateCreated,
      }
    }

    const bonus = outcome.amountOut - BigInt(intent.minAmountOut)

    return {
      variant: "success",
      title:
        bonus > 0n
          ? t("trade:intent.market.filled.bonus", {
              in: formatIn(intent.amountIn),
              received: formatOut(outcome.amountOut),
              bonus: formatOut(bonus),
            })
          : t("trade:intent.market.filled", {
              in: formatIn(intent.amountIn),
              received: formatOut(outcome.amountOut),
            }),
      dateCreated,
    }
  }

  const outcomes$ = useMemo(
    () =>
      isReady && hasIntentPallet
        ? watchIntentOutcomes(papiClient.blocks$, papi.event.Intent)
        : undefined,
    [isReady, hasIntentPallet, papi, papiClient],
  )

  useObservable(outcomes$, {
    enabled,
    onUpdate: (outcome) => {
      const match = tracked.find(
        ({ intentId }) => intentId === String(outcome.id),
      )
      if (!match) return
      edit(match.toastId, getToastUpdate(match.intent, outcome))
      if (outcome.kind === "resolved") {
        void queryClient.invalidateQueries({
          queryKey: MAX_WITHDRAW_ALL_QUERY_KEY,
        })
      }
    },
  })

  // Intents missing from storage at the previous check. Absent twice in a row
  // means the event reader had a whole interval to resolve it and didn't.
  const missingRef = useRef<ReadonlySet<string>>(new Set())

  useQuery({
    queryKey: ["intents", "toasts", tracked.map(({ intentId }) => intentId)],
    enabled,
    retry: false,
    notifyOnChangeProps: [],
    refetchInterval: STORAGE_CHECK_INTERVAL_MS,
    queryFn: async () => {
      // The toast turns `submitted` once the tx is in a best block, so the
      // intent is already in best-block storage by the time we check.
      const values = await papi.query.Intent.Intents.getValues(
        tracked.map(({ intentId }) => [BigInt(intentId)] as const),
        { at: "best" },
      )

      const missing = tracked.filter((_, index) => !values[index])

      missing
        .filter(({ intentId }) => missingRef.current.has(intentId))
        .forEach(({ toastId }) =>
          edit(toastId, {
            variant: "unknown",
            dateCreated: new Date().toISOString(),
          }),
        )
      missingRef.current = new Set(missing.map(({ intentId }) => intentId))

      return missing.length
    },
  })
}
