import {
  createQueryString,
  safeConvertAnyToH160,
  safeParse,
} from "@galacticcouncil/utils"

import {
  type BasejumpScanItem,
  basejumpSseEventSchema,
} from "@/modules/xcm/history/utils/basejump"

export type BasejumpScanSubscribeOptions = {
  onCreate: (transfer: BasejumpScanItem) => void
  onUpdate: (transfer: BasejumpScanItem) => void
}

export class BasejumpScanSseClient {
  private _baseUrl: string
  private eventSource: EventSource | null = null
  private onMessage: ((event: MessageEvent<string>) => void) | null = null

  constructor(baseUrl: string) {
    this._baseUrl = baseUrl
  }

  subscribe(address: string, options: BasejumpScanSubscribeOptions): void {
    this.unsubscribe()

    const h160 = safeConvertAnyToH160(address)
    const url = `${this._baseUrl}/api/events${createQueryString({ address: h160 })}`
    const eventSource = new EventSource(url)
    this.eventSource = eventSource

    this.onMessage = (event: MessageEvent<string>) => {
      const data = safeParse(event.data)
      const parsed = basejumpSseEventSchema.safeParse(data)
      if (!parsed.success) return

      const { kind, transfer } = parsed.data
      if (kind === "created") {
        options.onCreate(transfer)
      }

      if (kind === "updated") {
        options.onUpdate(transfer)
      }
    }

    eventSource.addEventListener("created", this.onMessage)
    eventSource.addEventListener("updated", this.onMessage)
  }

  unsubscribe(): void {
    if (!this.eventSource) return
    if (this.onMessage) {
      this.eventSource.removeEventListener("created", this.onMessage)
      this.eventSource.removeEventListener("updated", this.onMessage)
    }
    this.eventSource.close()
    this.eventSource = null
    this.onMessage = null
  }
}
