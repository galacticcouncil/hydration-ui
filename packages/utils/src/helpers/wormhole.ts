import { keccak_256 } from "@noble/hashes/sha3"
import { bytesToHex } from "@noble/hashes/utils"

import { createQueryString } from "./helpers"

type WormholescanLinkPath = "tx" | "account" | "block"

const WORMHOLESCAN_URL = "https://wormholescan.io"
const WORMHOLESCAN_API_URL = "https://api.wormholescan.io/api/v1"

export const wormholescan = {
  api: (path: string, query: Record<string, string | number> = {}) => {
    return `${WORMHOLESCAN_API_URL}/${path}${createQueryString(query)}`
  },
  link: (path: WormholescanLinkPath, data: string | number): string => {
    return `${WORMHOLESCAN_URL}/#/${path}/${data}`
  },
  tx: (txHash: string) => {
    return wormholescan.link("tx", txHash)
  },
}

export const getVaaHeader = (vaaRaw: string) => {
  const vaaBytes = Uint8Array.from(atob(vaaRaw), (c) => c.charCodeAt(0))

  const sigStart = 6
  const numSigners = vaaBytes[5]
  const sigLength = 66

  const body = vaaBytes.subarray(sigStart + sigLength * numSigners)
  const payload = body.subarray(51)

  const readUInt32BE = (arr: Uint8Array, offset: number) => {
    return (
      (arr[offset] << 24) |
      (arr[offset + 1] << 16) |
      (arr[offset + 2] << 8) |
      arr[offset + 3]
    )
  }

  const readUInt16BE = (arr: Uint8Array, offset: number) => {
    return (arr[offset] << 8) | arr[offset + 1]
  }

  const readBigUInt64BE = (arr: Uint8Array, offset: number) => {
    const high = readUInt32BE(arr, offset)
    const low = readUInt32BE(arr, offset + 4)
    return (BigInt(high) << 32n) | BigInt(low)
  }

  const hash = keccak_256(body)

  return {
    timestamp: readUInt32BE(body, 0),
    emitterChain: readUInt16BE(body, 8),
    emitterAddress: bytesToHex(body.subarray(10, 42)),
    sequence: readBigUInt64BE(body, 42),
    payload: payload,
    hash: hash,
    id: bytesToHex(keccak_256(hash)),
  }
}
