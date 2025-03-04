import { hexToU8a, u8aToBn } from "@polkadot/util"
import { wsToHttp } from "utils/formatting"

/**
 * Sends a ping request to the specified URL and measures the round-trip time.
 * @param url The URL to ping.
 * @param timeoutMs The maximum time to wait for a response, in milliseconds.
 * @param signal `AbortSignal` to cancel the request.
 * @returns The round-trip time in milliseconds, or `Infinity` if the request timed out or failed.
 */
export async function pingRpc(
  url: string,
  timeoutMs = 5000,
  signal?: AbortSignal,
): Promise<number> {
  return new Promise<number>((resolve) => {
    const execute = async () => {
      const start = performance.now()

      try {
        const end = await Promise.race([
          (async () => {
            try {
              await jsonRpcFetch(
                wsToHttp(url),
                "chain_getBlockHash",
                [],
                signal,
              )
              return performance.now()
            } catch {
              return Infinity
            }
          })(),
          new Promise<number>((resolve) =>
            setTimeout(() => resolve(Infinity), timeoutMs),
          ),
        ])

        resolve(end - start)
      } catch {
        resolve(Infinity)
      }
    }

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      requestIdleCallback(execute, { timeout: timeoutMs })
    } else {
      execute()
    }
  })
}

export type RpcInfoResult = {
  blockNumber: number | null
  timestamp: number | null
}

const TIMESTAMP_STORAGE_KEY =
  "0xf0c365c3cf59d671eb72da0e7a4113c49f1f0515f462cdcf84e0f1d6045dfcbb"

export async function fetchRpcInfo(url: string): Promise<RpcInfoResult> {
  const blockHashPromise = jsonRpcFetch(wsToHttp(url), "chain_getBlockHash")
  const headerPromise = blockHashPromise.then((blockHash) =>
    jsonRpcFetch(wsToHttp(url), "chain_getHeader", [blockHash]),
  )
  const storagePromise = blockHashPromise.then((blockHash) =>
    jsonRpcFetch(wsToHttp(url), "state_getStorage", [
      TIMESTAMP_STORAGE_KEY,
      blockHash,
    ]),
  )

  const [header, ts] = await Promise.allSettled([headerPromise, storagePromise])

  if (header.status === "fulfilled" && ts.status === "fulfilled") {
    const timestamp = u8aToBn(hexToU8a(ts.value), { isLe: true }).toNumber()
    const blockNumber = parseInt(header.value.number, 16)
    return {
      timestamp,
      blockNumber,
    }
  } else {
    throw new Error("Failed to fetch RPC info")
  }
}

async function jsonRpcFetch(
  url: string,
  method: string,
  params: string[] = [],
  signal?: AbortSignal,
): Promise<any> {
  const res = await fetch(url, {
    signal,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method,
      params,
    }),
  })

  if (!res.ok) {
    throw new Error("Failed to fetch")
  }

  const json = await res.json()

  if (!json.result) {
    throw new Error("Invalid RPC response")
  }

  return json.result
}
