import { intentscan } from "@galacticcouncil/utils"
import z from "zod"

export const intentOrderSchema = z.object({
  transfer_sequence: z.string(),
  state: z.string(),
  settlement_status: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
})

export type IntentOrder = z.infer<typeof intentOrderSchema>

export type IntentOrderResolution = {
  processed: boolean
  status: "success" | "error" | "warning" | "unknown"
  dateUpdated?: string
}

/** Fetch one order by NTT manager sequence. */
export const fetchIntentOrder = async (
  sequence: string,
): Promise<IntentOrder | null> => {
  let res: Response

  try {
    res = await fetch(
      `${intentscan.baseUrl}/api/orders/${encodeURIComponent(sequence)}`,
    )
  } catch {
    return null
  }

  if (!res.ok) return null

  return intentOrderSchema.parse(await res.json())
}

/**
 * Map order state to a toast outcome. `placed` and `processed` mean the swap
 * isn't done yet. Contracts finished their part; NEAR hasn't. Those stay
 * unprocessed, same as any state we don't recognize.
 */
export const resolveIntentOrder = (
  order: IntentOrder,
): IntentOrderResolution => {
  const dateUpdated = order.updated_at ?? undefined

  switch (order.state) {
    case "settled":
      return { status: "success", processed: true, dateUpdated }
    case "refunded":
      return {
        status: "warning",
        processed: true,
        dateUpdated,
      }
    case "failed":
      return { status: "error", processed: true, dateUpdated }
    default:
      return { status: "unknown", processed: false }
  }
}
