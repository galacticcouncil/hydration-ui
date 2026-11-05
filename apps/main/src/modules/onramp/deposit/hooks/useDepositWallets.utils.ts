import {
  NEAR_PROVIDERS,
  WalletProviderType,
} from "@galacticcouncil/web3-connect/src/config/providers"
import type { WalletSourceLike } from "@galacticcouncil/web3-connect/src/utils/walletSource"

export type DepositWalletResult =
  | "waiting"
  | "pending"
  | "connected"
  | "rejected"
  | "skipped"

export const isDetectedDepositWallet = (wallet: WalletSourceLike): boolean =>
  wallet.installed &&
  wallet.provider !== WalletProviderType.ExternalWallet &&
  wallet.provider !== WalletProviderType.WalletConnect &&
  (!NEAR_PROVIDERS.includes(wallet.provider) || wallet.hasExtension === true)

type DepositWalletQueueOptions = {
  connect: (provider: WalletProviderType) => Promise<boolean>
  abandon: (provider: WalletProviderType) => void
  onResult: (provider: WalletProviderType, result: DepositWalletResult) => void
}

/** Skip releases the queue, while a late wallet response cannot overwrite its settled result. */
export const startDepositWalletQueue = (
  providers: WalletProviderType[],
  { connect, abandon, onResult }: DepositWalletQueueOptions,
) => {
  let canceled = false
  let skipCurrent: (() => void) | undefined
  const done = (async () => {
    for (const provider of providers) {
      if (canceled) break
      onResult(provider, "pending")
      const result = await new Promise<DepositWalletResult>((resolve) => {
        let settled = false
        const settle = (result: DepositWalletResult) => {
          if (settled) return
          settled = true
          resolve(result)
        }
        skipCurrent = () => {
          if (settled) return
          abandon(provider)
          settle("skipped")
        }
        void connect(provider).then(
          (connected) => settle(connected ? "connected" : "rejected"),
          () => settle("rejected"),
        )
      })
      skipCurrent = undefined
      onResult(provider, result)
    }
  })()

  return {
    done,
    skip: () => skipCurrent?.(),
    cancel: () => {
      canceled = true
      skipCurrent?.()
    },
  }
}
