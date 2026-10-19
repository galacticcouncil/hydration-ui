import { ScanClient } from "."

/** The streams a scan app publishes row changes on. */
export type ScanFlow = "ntt" | "utxo" | "utxo-signs" | "basejump" | "orders"

const SCAN_EVENT_KINDS = ["created", "updated"] as const

export type ScanEventHandlers = {
  /** A row changed in one of the followed flows. */
  readonly onChange: () => void
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

  if (onOpen) source.addEventListener("open", onOpen)
  for (const kind of SCAN_EVENT_KINDS) source.addEventListener(kind, onChange)

  return () => source.close()
}
