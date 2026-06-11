import { XcBalanceRequest } from "@/modules/balances/api/xcBalanceBuilder"
import {
  XcBalanceEvent,
  XcBalanceStatusEvent,
  XcBalanceSyncedEvent,
} from "@/modules/balances/api/xcBalanceTypes"

export type OcelloidsBalancesSseOptions = {
  onStatus(event: XcBalanceStatusEvent, req: XcBalanceRequest): void
  onBalance(event: XcBalanceEvent, req: XcBalanceRequest): void
  onSynced(event: XcBalanceSyncedEvent, req: XcBalanceRequest): void
  onOpen(): void
  onError(error: Event): void
}

const toQueryString = (request: XcBalanceRequest): string => {
  const params = new URLSearchParams()
  const { account } = request.criteria

  if (Array.isArray(account)) {
    account.forEach((address) => params.append("account", address))
  } else {
    params.set("account", account)
  }

  return params.toString()
}

export class OcelloidsBalancesSseClient {
  private _baseUrl: string

  constructor(baseUrl: string) {
    this._baseUrl = baseUrl
  }

  subscribe(
    request: XcBalanceRequest,
    opts: OcelloidsBalancesSseOptions,
  ): () => void {
    const endpoint = `${this._baseUrl}/sse/steward/balances`
    const query = toQueryString(request)

    let eventSource: EventSource | null = null
    let closed = false

    const connect = (): void => {
      if (closed) return

      eventSource = new EventSource(`${endpoint}?${query}`)
      eventSource.onopen = () => opts.onOpen()

      eventSource.addEventListener("status", (event) =>
        opts.onStatus(JSON.parse(event.data), request),
      )

      eventSource.addEventListener("balance", (event) =>
        opts.onBalance(JSON.parse(event.data), request),
      )

      eventSource.addEventListener("synced", (event) =>
        opts.onSynced(JSON.parse(event.data), request),
      )

      eventSource.onerror = (error) => {
        opts.onError(error)
        if (eventSource && eventSource.readyState === EventSource.CLOSED) {
          console.log("SSE closed, reconnecting in 5s...")
          eventSource.close()
        }
      }
    }

    connect()

    return () => {
      closed = true
      eventSource?.close()
    }
  }
}
