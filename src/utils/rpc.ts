import { wsToHttp } from "utils/formatting"

export type PingResponse = {
  url: string
  timestamp: number
  ping: number | null
  blockNumber: number | null
}

/**
 * Sends a ping request to the specified URL and measures the round-trip time.
 * @param url The URL to ping.
 * @param timeoutMs The maximum time to wait for a response, in milliseconds.
 * @param signal `AbortSignal` to cancel the request.
 * @returns The status with blockNumber, timestamp and ping in milliseconds, or `Infinity` if the request timed out or failed.
 */
export async function pingRpc(
  url: string,
  timeoutMs = 5000,
  signal?: AbortSignal,
): Promise<PingResponse> {
  return new Promise<PingResponse>((resolve) => {
    const execute = async () => {
      let defaultResponse: PingResponse = {
        url,
        ping: Infinity,
        timestamp: 0,
        blockNumber: null,
      }

      try {
        const response = await Promise.race([
          (async () => {
            try {
              const start = performance.now()
              const latestBlock = await jsonRpcFetch(
                wsToHttp(url),
                "eth_getBlockByNumber",
                ["latest", false],
                signal,
              )
              const ping = performance.now() - start

              return {
                url,
                ping,
                blockNumber: parseInt(latestBlock.number, 16),
                timestamp: parseInt(latestBlock.timestamp, 16) * 1000,
              }
            } catch {
              return defaultResponse
            }
          })(),
          new Promise<PingResponse>((resolve) =>
            setTimeout(() => resolve(defaultResponse), timeoutMs),
          ),
        ])

        resolve(response)
      } catch {
        resolve(defaultResponse)
      }
    }

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      requestIdleCallback(execute, { timeout: timeoutMs })
    } else {
      execute()
    }
  })
}

async function jsonRpcFetch(
  url: string,
  method: string,
  params: (string | boolean | number)[] = [],
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
