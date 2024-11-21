import { WsProvider } from "@polkadot/api"

/**
 * Sends a ping request to the specified URL and measures the round-trip time.
 * @param url The URL to ping.
 * @param timeoutMs The maximum time to wait for a response, in milliseconds.
 * @returns The round-trip time in milliseconds, or `Infinity` if the request timed out or failed.
 */
export async function pingRpc(url: string, timeoutMs = 5000): Promise<number> {
  const start = performance.now()
  const provider = new WsProvider(url, false)

  try {
    const end = await Promise.race([
      new Promise<number>((resolve) => {
        provider.connect()
        provider.on("connected", () => {
          provider.disconnect()
          resolve(performance.now())
        })
        provider.on("error", () => {
          provider.disconnect()
          resolve(Infinity)
        })
      }),
      new Promise<number>((resolve) => {
        setTimeout(() => {
          provider.disconnect()
          resolve(Infinity)
        }, timeoutMs)
      }),
    ])

    return Math.round(end - start)
  } catch (error) {
    return Infinity
  }
}
