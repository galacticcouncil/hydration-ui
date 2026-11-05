import type { WalletProviderType } from "@/config/providers"

type ConnectionResult = "pending" | "connected" | "rejected" | "timedOut"

/** Keep extension authorization prompts separate, and continue after a rejection. */
export const connectWalletsSequentially = async (
  providers: WalletProviderType[],
  options: {
    isConnected: (provider: WalletProviderType) => boolean
    connect: (provider: WalletProviderType) => Promise<unknown>
    onResult: (provider: WalletProviderType, result: ConnectionResult) => void
    abandon: (provider: WalletProviderType) => void
    timeoutMs?: number
  },
) => {
  for (const provider of providers) {
    if (options.isConnected(provider)) continue
    options.onResult(provider, "pending")
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      const result = await Promise.race([
        options.connect(provider).then(() => "connected" as const),
        new Promise<"timedOut">((resolve) => {
          timer = setTimeout(() => {
            options.abandon(provider)
            resolve("timedOut")
          }, options.timeoutMs ?? 60_000)
        }),
      ])
      options.onResult(provider, result)
    } catch {
      options.onResult(provider, "rejected")
    } finally {
      clearTimeout(timer)
    }
  }
}
