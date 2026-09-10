import type { PingResponse } from "@galacticcouncil/utils"
import { expose } from "comlink"

function wsToHttp(url: string) {
  return url.replace(/^(ws)(s)?:\/\//, (_, _insecure, secure) =>
    secure ? "https://" : "http://",
  )
}

function hexToBytes(hex: string): Uint8Array {
  const normalized = hex.startsWith("0x") ? hex.slice(2) : hex
  const bytes = new Uint8Array(normalized.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(normalized.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

function decodeCompactNumber(bytes: Uint8Array): number {
  const byte0 = bytes[0]
  if (byte0 === undefined) return 0

  const mode = byte0 & 0b11

  if (mode === 0) return byte0 >> 2

  if (mode === 1) {
    const byte1 = bytes[1]
    if (byte1 === undefined) return 0
    return ((byte0 >> 2) | (byte1 << 6)) >>> 0
  }

  if (mode === 2) {
    const byte1 = bytes[1]
    const byte2 = bytes[2]
    const byte3 = bytes[3]
    if (byte1 === undefined || byte2 === undefined || byte3 === undefined) {
      return 0
    }
    return ((byte0 >> 2) | (byte1 << 6) | (byte2 << 14) | (byte3 << 22)) >>> 0
  }

  const len = (byte0 >> 2) + 4
  let result = 0n
  for (let i = 1; i <= len; i++) {
    const byte = bytes[i]
    if (byte === undefined) break
    result |= BigInt(byte) << BigInt(8 * (i - 1))
  }

  return Number(result)
}

const BLOCK_ID = 1
const GENESIS_HASH_ID = 2

type JsonRpcResponse = {
  id?: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result?: any
}

function findResultById(responses: JsonRpcResponse[], id: number) {
  return responses.find((response) => response?.id === id)?.result
}

const getBlock = async (
  wsUrl: string,
  timeoutMs = 5000,
  signal?: AbortSignal,
): Promise<PingResponse> => {
  const defaultResponse: PingResponse = {
    url: wsUrl,
    ping: Infinity,
    timestamp: 0,
    blockNumber: null,
    genesisHash: null,
  }

  if (signal?.aborted) return defaultResponse

  const controller = new AbortController()
  const onParentAbort = () => controller.abort()
  signal?.addEventListener("abort", onParentAbort)

  let timeoutId: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      (async () => {
        const start = performance.now()
        const res = await fetch(wsToHttp(wsUrl), {
          signal: controller.signal,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify([
            {
              id: BLOCK_ID,
              jsonrpc: "2.0",
              method: "chain_getBlock",
              params: [],
            },
            {
              id: GENESIS_HASH_ID,
              jsonrpc: "2.0",
              method: "chain_getBlockHash",
              params: [0],
            },
          ]),
        })
        const ping = performance.now() - start

        const data = await res.json()

        if (!Array.isArray(data)) return defaultResponse

        const block = findResultById(data, BLOCK_ID)
        const genesisHash = findResultById(data, GENESIS_HASH_ID)

        const blockNumber = Number(block?.block?.header?.number)
        const tsExtinsic = block?.block?.extrinsics?.[0]

        if (!Number.isFinite(blockNumber) || typeof tsExtinsic !== "string") {
          return defaultResponse
        }

        const tsBytes = hexToBytes(tsExtinsic)
        const timestamp = decodeCompactNumber(tsBytes.subarray(4))

        return {
          url: wsUrl,
          ping,
          blockNumber,
          timestamp,
          genesisHash: typeof genesisHash === "string" ? genesisHash : null,
        }
      })(),
      new Promise<PingResponse>(
        (resolve) =>
          (timeoutId = setTimeout(() => {
            controller.abort()
            resolve(defaultResponse)
          }, timeoutMs)),
      ),
    ])
  } catch {
    return defaultResponse
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId)
    signal?.removeEventListener("abort", onParentAbort)
  }
}

export const worker = {
  getBlock,
  getBestRpcs: async (
    wsUrls: string[],
    timeoutMs = 5000,
  ): Promise<PingResponse[]> => {
    const controller = new AbortController()
    const signal = controller.signal

    const results: PingResponse[] = []

    const promises = wsUrls.map(async (url) => {
      if (signal.aborted) return
      const res = await getBlock(url, timeoutMs, signal)
      if (res.ping === Infinity || signal.aborted) return

      results.push(res)
      results.sort((a, b) => b.timestamp - a.timestamp)

      // Wait for up to 3 results, then abort
      if (results.length === 3 || results.length === wsUrls.length) {
        controller.abort()
      }
    })

    await Promise.all(promises)

    if (results.length === 0) {
      throw new Error("All RPC providers failed or timed out")
    }

    return results
  },
}

expose(worker)
