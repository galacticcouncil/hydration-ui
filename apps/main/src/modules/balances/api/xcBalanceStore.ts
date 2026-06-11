import { OcelloidsBalancesSseClient } from "@/modules/balances/api/ocelloidsBalancesSseClient"
import { XcBalanceBuilder } from "@/modules/balances/api/xcBalanceBuilder"
import {
  XcBalance,
  XcBalanceEvent,
  xcBalanceKey,
} from "@/modules/balances/api/xcBalanceTypes"
import { normalizeXcAssetId } from "@/modules/balances/api/xcBalanceUtils"

const apiUrl = "https://api.ocelloids.net"

export type XcBalanceStoreCallbacks = {
  onLoad?(balances: XcBalance[]): void
  onNew?(balance: XcBalance): void
  onUpdate?(balance: XcBalance, prev: XcBalance): void
  onChange?(balances: XcBalance[]): void
  onOpen?(): void
  onError?(err: Event): void
}

const toRecord = (event: XcBalanceEvent): XcBalance => ({
  accountId: event.accountId,
  publicKey: event.publicKey,
  balance: event.balance,
  chainId: event.chainId,
  assetId: normalizeXcAssetId(event.assetId),
  symbol: event.symbol,
  decimals: event.decimals,
})

export class XcBalanceStore {
  private readonly sse: OcelloidsBalancesSseClient
  private store = new Map<string, XcBalance>()
  private unsubscribeSse?: () => void

  constructor(sseClient: OcelloidsBalancesSseClient) {
    this.sse = sseClient
  }

  dump(): XcBalance[] {
    return Array.from(this.store.values())
  }

  subscribe(address: string, cb: XcBalanceStoreCallbacks): void {
    this.store.clear()

    const request = XcBalanceBuilder.balances()
      .account(address)
      .build({ validate: true })

    let synced = false

    this.unsubscribeSse = this.sse.subscribe(request, {
      onOpen: () => cb.onOpen?.(),
      onError: (err) => cb.onError?.(err),
      onStatus: () => {},
      onBalance: (event) => {
        const record = toRecord(event)
        const key = xcBalanceKey(record)
        const prev = this.store.get(key)
        this.store.set(key, record)

        if (!synced) return

        if (prev) {
          cb.onUpdate?.(record, prev)
        } else {
          cb.onNew?.(record)
        }
        cb.onChange?.(this.dump())
      },
      onSynced: () => {
        if (synced) return
        synced = true
        cb.onLoad?.(this.dump())
      },
    })
  }

  unsubscribe(): void {
    this.unsubscribeSse?.()
    this.unsubscribeSse = undefined
    this.store.clear()
  }
}

export const xcBalanceSseClient = new OcelloidsBalancesSseClient(apiUrl)

export const xcBalanceStore = new XcBalanceStore(xcBalanceSseClient)
