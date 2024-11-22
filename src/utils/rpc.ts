import { wsToHttp } from "utils/formatting"

/**
 * Sends a ping request to the specified URL and measures the round-trip time.
 * @param url The URL to ping.
 * @param timeoutMs The maximum time to wait for a response, in milliseconds.
 * @returns The round-trip time in milliseconds, or `Infinity` if the request timed out or failed.
 */
export async function pingRpc(url: string, timeoutMs = 5000): Promise<number> {
  const start = performance.now()

  try {
    const end = await Promise.race([
      new Promise<number>(async (resolve) => {
        const res = await fetch(wsToHttp(url), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: 1,
            jsonrpc: "2.0",
            method: "chain_getBlockHash",
            params: [],
          }),
        })
        resolve(res.ok ? performance.now() : Infinity)
      }),
      new Promise<number>((resolve) => {
        setTimeout(() => {
          resolve(Infinity)
        }, timeoutMs)
      }),
    ])

    return Math.round(end - start)
  } catch (error) {
    return Infinity
  }
}
