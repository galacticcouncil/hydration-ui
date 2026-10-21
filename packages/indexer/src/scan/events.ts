import z from "zod/v4"

import { ScanClient } from "."

/** The streams a scan app publishes row changes on. */
export type ScanFlow = "ntt" | "utxo" | "utxo-signs" | "basejump" | "orders"

const SCAN_EVENT_KINDS = ["created", "updated"] as const

const scanUpdateSchema = z.object({
  flow: z.string(),
  kind: z.enum(SCAN_EVENT_KINDS),
  /**
   * The changed row, as the flow's table holds it. A flow the app relays from
   * another, like the transfers app's ntt, carries only `{ id, state }`.
   */
  record: z.record(z.string(), z.unknown()),
})

/** A row change, as a scan app streams it. */
export type ScanUpdate = z.infer<typeof scanUpdateSchema>

const parseScanUpdate = (data: string): ScanUpdate | null => {
  try {
    return scanUpdateSchema.parse(JSON.parse(data))
  } catch {
    return null
  }
}

export type ScanEventHandlers = {
  /** A row changed in one of the followed flows; null if its payload is unknown. */
  readonly onChange: (update: ScanUpdate | null) => void
  /** The stream (re)connected, the first time included. */
  readonly onOpen?: () => void
}

/**
 * Follows a scan app's row changes, every account's alike. Nothing replays a
 * dropped stream, so a change and a reconnect are only cues to refetch.
 */
export const subscribeScanEvents = (
  client: ScanClient,
  flows: readonly ScanFlow[],
  { onChange, onOpen }: ScanEventHandlers,
): (() => void) => {
  const source = new EventSource(
    `${client.baseUrl}/api/events?flow=${encodeURIComponent(flows.join(","))}`,
  )

  const onEvent = (event: MessageEvent<string>) =>
    onChange(parseScanUpdate(event.data))

  if (onOpen) source.addEventListener("open", onOpen)
  for (const kind of SCAN_EVENT_KINDS) source.addEventListener(kind, onEvent)

  return () => source.close()
}
