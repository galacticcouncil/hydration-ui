import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { WalletProviderType } from "@/config/providers"
import { useWalletSubscriptions } from "@/hooks/useWalletSubscriptions"
import {
  StoredAccount,
  useWeb3Connect,
  WalletProviderStatus,
} from "@/hooks/useWeb3Connect"
import { WalletAccount } from "@/types/wallet"
import { AccountsSubscribeOptions } from "@/utils/wallet"

const { subscriptions, effectCleanups } = vi.hoisted(() => ({
  subscriptions: new Map<
    WalletProviderType,
    {
      callbacks: AccountsSubscribeOptions
      unsubscribe: ReturnType<typeof vi.fn>
    }[]
  >(),
  effectCleanups: [] as (() => void)[],
}))

vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useEffect: (effect: () => void | (() => void)) => {
    const cleanup = effect()
    if (cleanup) effectCleanups.push(cleanup)
  },
}))
vi.mock("zustand/middleware", () => ({
  persist: (creator: unknown) => creator,
}))
vi.mock("@galacticcouncil/utils", () => ({
  METADATA_CDN_URL: "https://metadata.invalid",
  updateQueryString: vi.fn(),
}))
vi.mock("@/utils/wallet", () => ({
  getUniqueAccountKey: (account: StoredAccount) =>
    `${account.provider}:${account.address}`,
  toStoredAccount: (account: WalletAccount): StoredAccount => ({
    ...account,
    rawAddress: account.address,
    publicKey: `${account.address}-public-key`,
  }),
  subscribeWalletAccounts: (
    wallet: { provider: WalletProviderType },
    callbacks: AccountsSubscribeOptions,
  ) => {
    const subscription = { callbacks, unsubscribe: vi.fn() }
    subscriptions.set(wallet.provider, [
      ...(subscriptions.get(wallet.provider) ?? []),
      subscription,
    ])
    return subscription.unsubscribe
  },
}))
vi.mock("@/wallets/BaseSubstrateWallet", () => ({
  BaseSubstrateWallet: class {},
}))
vi.mock("@/wallets", () => {
  const wallets = [
    { provider: "subwallet", title: "SubWallet" },
    { provider: "subwallet-evm", title: "SubWallet" },
    { provider: "subwallet-h160", title: "SubWallet" },
    { provider: "polkadot-js", title: "Polkadot.js" },
  ]
  return {
    getWallet: (provider: WalletProviderType) =>
      wallets.find((wallet) => wallet.provider === provider),
    getWallets: () => wallets,
    ExternalWallet: class {},
  }
})

const account = (
  provider: WalletProviderType,
  name = provider as string,
): StoredAccount => ({
  provider,
  name,
  address: `${name}-address`,
  rawAddress: `${name}-address`,
  publicKey: `${name}-address-public-key`,
})
const connect = (next: StoredAccount) => {
  useWeb3Connect.getState().connectProvider([next], next.provider)
  useWeb3Connect.setState({ account: next })
}
const latestSubscription = (provider: WalletProviderType) => {
  const subscription = subscriptions.get(provider)?.at(-1)
  if (!subscription) throw new Error(`Missing subscription for ${provider}`)
  return subscription
}
const initialState = useWeb3Connect.getState()

beforeEach(() => {
  subscriptions.clear()
  useWeb3Connect.setState(initialState, true)
})
afterEach(() => {
  effectCleanups.splice(0).forEach((cleanup) => cleanup())
})

describe("wallet account subscription lifecycle", () => {
  it("ignores queued account and disconnect events from a replaced wallet type", () => {
    useWalletSubscriptions()
    const previous = account(WalletProviderType.Subwallet)
    connect(previous)
    const stale = latestSubscription(previous.provider)
    const next = account(WalletProviderType.SubwalletEvm)

    connect(next)
    stale.callbacks.onAccountsChange([previous])
    stale.callbacks.onMainAccountChange(previous)
    stale.callbacks.onDisconnect()

    expect(stale.unsubscribe).toHaveBeenCalledTimes(1)
    expect(useWeb3Connect.getState()).toMatchObject({
      accounts: [next],
      account: next,
      providers: [
        { type: next.provider, status: WalletProviderStatus.Connected },
      ],
    })
  })

  it("rejects old queued events even after the same provider has reconnected", () => {
    useWalletSubscriptions()
    const previous = account(WalletProviderType.Subwallet, "old")
    connect(previous)
    const stale = latestSubscription(previous.provider)
    useWeb3Connect.getState().disconnect(previous.provider)
    const next = account(WalletProviderType.Subwallet, "new")
    connect(next)
    const current = latestSubscription(next.provider)

    stale.callbacks.onAccountsChange([previous])
    stale.callbacks.onMainAccountChange(previous)
    stale.callbacks.onDisconnect()

    expect(current).not.toBe(stale)
    expect(stale.unsubscribe).toHaveBeenCalledTimes(1)
    expect(current.unsubscribe).not.toHaveBeenCalled()
    expect(useWeb3Connect.getState()).toMatchObject({
      accounts: [next],
      account: next,
      providers: [
        { type: next.provider, status: WalletProviderStatus.Connected },
      ],
    })
  })

  it("accepts account updates from the current subscription after reconnecting", () => {
    useWalletSubscriptions()
    const previous = account(WalletProviderType.Subwallet, "old")
    connect(previous)
    useWeb3Connect.getState().disconnect(previous.provider)
    const next = account(WalletProviderType.Subwallet, "new")
    connect(next)
    const current = latestSubscription(next.provider)
    const changed = account(next.provider, "changed")

    current.callbacks.onAccountsChange([changed])
    current.callbacks.onMainAccountChange(changed)

    expect(useWeb3Connect.getState().accounts).toEqual([changed])
    expect(useWeb3Connect.getState().account).toEqual(changed)
    expect(current.unsubscribe).not.toHaveBeenCalled()
  })

  it("invalidates queued events when the app subscription owner unmounts", () => {
    useWalletSubscriptions()
    const active = account(WalletProviderType.Subwallet)
    connect(active)
    const stale = latestSubscription(active.provider)
    effectCleanups.splice(0).forEach((cleanup) => cleanup())
    const changed = account(active.provider, "late")

    stale.callbacks.onAccountsChange([changed])
    stale.callbacks.onMainAccountChange(changed)
    stale.callbacks.onDisconnect()

    expect(stale.unsubscribe).toHaveBeenCalledTimes(1)
    expect(useWeb3Connect.getState()).toMatchObject({
      accounts: [active],
      account: active,
      providers: [
        { type: active.provider, status: WalletProviderStatus.Connected },
      ],
    })
  })
})
