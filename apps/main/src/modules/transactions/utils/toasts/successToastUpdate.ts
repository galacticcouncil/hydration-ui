import { intentscan, neckwork } from "@galacticcouncil/utils"
import { isObjectType } from "remeda"

import {
  getDcaScheduleIdFromEvents,
  getExplorerTxLink,
} from "@/modules/transactions/utils/tx"
import { getXcSwapSequence } from "@/modules/transactions/utils/xcSwap"
import {
  isSubstrateTxResult,
  TransactionMeta,
  TransactionType,
  TSuccessResult,
} from "@/states/transactions"

export type SuccessToastUpdate = {
  readonly variant: "submitted" | "success"
  readonly title?: string
  readonly link: string | null
  readonly meta?: TransactionMeta
}

/**
 * What a transaction's toast becomes once the tx is in a block. Xcm, XcSwap
 * and ICE intents aren't done yet, so they stay `submitted` for the toast
 * processor; everything else is a plain success.
 */
export const getSuccessToastUpdate = (
  meta: TransactionMeta,
  result: TSuccessResult,
  successTitle: string,
): SuccessToastUpdate => {
  const link = getFinalizedTransactionLink(meta, result)

  switch (meta.type) {
    case TransactionType.Xcm:
      return { variant: "submitted", link }

    case TransactionType.XcSwap: {
      const sequence = getXcSwapSequence(result)
      return sequence
        ? {
            variant: "submitted",
            link: intentscan.order(sequence),
            meta: { ...meta, sequence },
          }
        : { variant: "submitted", link, meta }
    }

    case TransactionType.Onchain: {
      const intentId =
        meta.intent && isSubstrateTxResult(result)
          ? getIntentIdFromEvents(result.events)
          : null

      if (meta.intent && intentId) {
        return {
          variant: "submitted",
          title: successTitle,
          link,
          meta: { ...meta, intent: { ...meta.intent, id: intentId } },
        }
      }

      return { variant: "success", title: successTitle, link }
    }

    case TransactionType.EvmApprove:
      return { variant: "success", title: successTitle, link }
  }
}

const getFinalizedTransactionLink = (
  meta: TransactionMeta,
  result: TSuccessResult,
): string | null => {
  if (!isSubstrateTxResult(result)) return null

  const scheduleId = getDcaScheduleIdFromEvents(result.events)
  if (scheduleId !== null) {
    return neckwork.activityDca(scheduleId)
  }

  const { number, index } = result.block
  return getExplorerTxLink(meta, number, index) ?? null
}

const getIntentIdFromEvents = (
  events: ReadonlyArray<{ type: string; value: unknown }>,
): string | null => {
  for (const event of events) {
    if (event.type !== "Intent" || !isObjectType(event.value)) continue
    if (!("type" in event.value) || event.value.type !== "IntentSubmitted") {
      continue
    }
    if (!("value" in event.value) || !isObjectType(event.value.value)) continue
    const { id } = event.value.value as { id?: unknown }
    if (typeof id === "bigint") return id.toString()
  }
  return null
}
