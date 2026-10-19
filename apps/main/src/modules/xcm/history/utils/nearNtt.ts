import { chainsMap } from "@galacticcouncil/xc-cfg"
import { Wormhole } from "@galacticcouncil/xc-core"
import { bytesToHex } from "viem"

import { NEAR_CHAIN_KEY } from "./journey"

const TRANSCEIVER_PREFIX = "0x9945ff10"
const NTT_PREFIX = "0x994e5454"

// A wormhole transceiver message: prefix (4), source and recipient managers
// (32 each) and the manager message's length (2), then that message: id (32),
// sender (32), payload length (2) and the transfer: prefix (4), decimals (1),
// amount (8), source token (32), recipient (32), recipient chain (2)
const SENDER = 4 + 32 + 32 + 2 + 32
const TRANSFER = SENDER + 32 + 2
const TRANSFER_LENGTH = 4 + 1 + 8 + 32 + 32 + 2

/** An ntt transfer, its parties as 32-byte universal addresses. */
export type NttTransfer = {
  sender: string
  to: string
  toChain: number
  /** Trimmed to `decimals`, as ntt carries it. */
  amount: bigint
  decimals: number
}

/** The ntt transfer a wormhole transceiver message carries, if it is one. */
export const parseNttTransfer = (
  payload: Uint8Array,
): NttTransfer | undefined => {
  if (payload.length < TRANSFER + TRANSFER_LENGTH) return
  if (bytesToHex(payload.subarray(0, 4)) !== TRANSCEIVER_PREFIX) return
  if (bytesToHex(payload.subarray(TRANSFER, TRANSFER + 4)) !== NTT_PREFIX) {
    return
  }

  const view = new DataView(
    payload.buffer,
    payload.byteOffset,
    payload.byteLength,
  )

  return {
    sender: bytesToHex(payload.subarray(SENDER, SENDER + 32)),
    decimals: view.getUint8(TRANSFER + 4),
    amount: view.getBigUint64(TRANSFER + 5),
    to: bytesToHex(payload.subarray(TRANSFER + 45, TRANSFER + 77)),
    toChain: view.getUint16(TRANSFER + 77),
  }
}

/** How ntt names a NEAR account: the hash of its id. */
export const toNearUniversal = (accountId: string): string | undefined => {
  const near = chainsMap.get(NEAR_CHAIN_KEY)
  return near ? Wormhole.fromChain(near).normalizeAddress(accountId) : undefined
}
