// Vendored from upstream
// `packages/common/src/transact/broadcaster-transact-response.ts`, **stubbed**.
//
// The upstream class decrypts transact-response messages with
// `decryptAESGCM256` from `@railgun-community/wallet`. We don't depend on that
// package today. Until we either add it or re-implement AES-GCM-256 against
// `@railgun-community/engine`, the transact-via-broadcaster path is not
// wired — `BroadcasterProvider.broadcastTransaction()` falls back to
// self-relay when a broadcaster is selected.
//
// We keep the class shape so `WakuObservers` can still wire the
// `transactResponse` content topic without an undefined import. Incoming
// messages just get logged + ignored.
import { type IMessage } from "@waku/sdk"
import { BroadcasterDebug } from "../utils/broadcaster-debug.js"
import { isDefined } from "../utils/is-defined.js"

export type WakuTransactResponse = {
  id: string
  txHash?: string
  error?: string
}

export class BroadcasterTransactResponse {
  static storedTransactionResponse: Optional<WakuTransactResponse>
  static sharedKey: Optional<Uint8Array>

  static setSharedKey = (key: Uint8Array) => {
    BroadcasterTransactResponse.sharedKey = key
    BroadcasterTransactResponse.storedTransactionResponse = undefined
  }

  static clearSharedKey = () => {
    BroadcasterTransactResponse.sharedKey = undefined
    BroadcasterTransactResponse.storedTransactionResponse = undefined
  }

  static async handleBroadcasterTransactionResponseMessage(message: IMessage) {
    if (!isDefined(message.payload)) {
      return
    }
    BroadcasterDebug.log(
      "Transact-response received (ignored: wallet decrypt not wired).",
    )
  }
}
