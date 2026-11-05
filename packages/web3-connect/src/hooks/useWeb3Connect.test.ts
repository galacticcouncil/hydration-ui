import { beforeEach, describe, expect, it, vi } from "vitest"

import { WalletProviderType } from "@/config/providers"
import { WalletMode } from "@/config/wallet"
import {
  StoredAccount,
  useWeb3Connect,
  WalletProviderStatus,
  WalletRestoreState,
} from "@/hooks/useWeb3Connect"

// Exercise the real store updates without browser persistence in this node suite.
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
}))
vi.mock("@/wallets/BaseSubstrateWallet", () => ({
  BaseSubstrateWallet: class {},
}))
vi.mock("@/wallets", () => ({
  getWallet: vi.fn(),
  ExternalWallet: class {},
  getWallets: () => [
    { provider: "subwallet", title: "SubWallet" },
    { provider: "subwallet-evm", title: "SubWallet" },
    { provider: "subwallet-h160", title: "SubWallet" },
    { provider: "talisman", title: "Talisman" },
    { provider: "talisman-evm", title: "Talisman" },
    { provider: "polkadot-js", title: "Polkadot.js" },
  ],
}))

const account = (
  provider: WalletProviderType,
  name = provider as string,
): StoredAccount => ({
  provider,
  name,
  address: `${name}-address`,
  rawAddress: `${name}-address`,
  publicKey: `${name}-public-key`,
})
const connected = (type: WalletProviderType) => ({
  type,
  status: WalletProviderStatus.Connected,
})

const initialState = useWeb3Connect.getState()

beforeEach(() => {
  useWeb3Connect.setState(initialState, true)
})

describe("exclusive wallet connections", () => {
  it("replaces sibling account types in one observable update", () => {
    const substrate = account(WalletProviderType.Subwallet)
    const h160 = account(WalletProviderType.SubwalletH160)
    const other = account(WalletProviderType.PolkadotJS)
    const evm = account(WalletProviderType.SubwalletEvm)
    useWeb3Connect.setState({
      accounts: [substrate, h160, other],
      account: substrate,
      providers: [
        connected(substrate.provider),
        connected(h160.provider),
        connected(other.provider),
      ],
      restoreStates: {
        [substrate.provider]: WalletRestoreState.Restoring,
        [h160.provider]: WalletRestoreState.Unavailable,
        [evm.provider]: WalletRestoreState.Restoring,
        [other.provider]: WalletRestoreState.Restoring,
      },
    })
    const changes = vi.fn()
    const unsubscribe = useWeb3Connect.subscribe(changes)

    useWeb3Connect.getState().connectProvider([evm], evm.provider)
    unsubscribe()

    expect(changes).toHaveBeenCalledTimes(1)
    expect(useWeb3Connect.getState()).toMatchObject({
      accounts: [other, evm],
      account: evm,
      providers: [connected(other.provider), connected(evm.provider)],
      restoreStates: { [other.provider]: WalletRestoreState.Restoring },
      recentProvider: evm.provider,
    })
  })

  it("preserves an active account from another wallet and all modal context", () => {
    const old = account(WalletProviderType.Subwallet)
    const active = account(WalletProviderType.PolkadotJS)
    const next = account(WalletProviderType.SubwalletEvm)
    const meta = { title: "Select source", hideExternalWallet: true }
    useWeb3Connect.setState({
      accounts: [old, active],
      account: active,
      providers: [connected(old.provider), connected(active.provider)],
      open: true,
      mode: WalletMode.EVM,
      meta,
      error: "An earlier error",
      recentlyUsedProviders: [active.provider, old.provider],
    })

    useWeb3Connect.getState().connectProvider([next], next.provider)

    expect(useWeb3Connect.getState()).toMatchObject({
      account: active,
      accounts: [active, next],
      open: true,
      mode: WalletMode.EVM,
      meta,
      error: "",
      recentlyUsedProviders: [active.provider, old.provider],
    })
  })

  it("replaces the chosen type's accounts without dropping multiple accounts of that type", () => {
    const old = account(WalletProviderType.SubwalletEvm, "old")
    const other = account(WalletProviderType.PolkadotJS)
    const first = account(WalletProviderType.SubwalletEvm, "first")
    const second = account(WalletProviderType.SubwalletEvm, "second")
    useWeb3Connect.setState({
      accounts: [old, other],
      account: other,
      providers: [connected(old.provider), connected(other.provider)],
    })

    useWeb3Connect
      .getState()
      .connectProvider([first, second, first], first.provider)

    expect(useWeb3Connect.getState().accounts).toEqual([other, first, second])
    expect(useWeb3Connect.getState().providers).toEqual([
      connected(other.provider),
      connected(first.provider),
    ])
  })

  it("selects a returned account when reconnecting the same type loses its active address", () => {
    const previous = account(WalletProviderType.Subwallet, "removed")
    const next = account(WalletProviderType.Subwallet, "new")
    useWeb3Connect.setState({
      accounts: [previous],
      account: previous,
      providers: [connected(previous.provider)],
    })

    useWeb3Connect.getState().connectProvider([next], next.provider)

    expect(useWeb3Connect.getState().accounts).toEqual([next])
    expect(useWeb3Connect.getState().account).toEqual(next)
  })

  it("retains an active multisig when its signer is still authorized after reconnecting", () => {
    const signer = account(WalletProviderType.Subwallet, "signer")
    const multisig: StoredAccount = {
      ...account(WalletProviderType.Subwallet, "multisig"),
      isMultisig: true,
      multisigSignerAddress: signer.address,
    }
    useWeb3Connect.setState({
      accounts: [signer],
      account: multisig,
      providers: [connected(signer.provider)],
    })

    useWeb3Connect.getState().connectProvider([signer], signer.provider)

    expect(useWeb3Connect.getState().accounts).toEqual([signer])
    expect(useWeb3Connect.getState().account).toEqual(multisig)
  })

  it("cancels a pending sibling without clearing a connected sibling or modal state", () => {
    const active = account(WalletProviderType.Subwallet)
    const pending = account(WalletProviderType.SubwalletEvm)
    const meta = { title: "Choose wallet" }
    useWeb3Connect.setState({
      accounts: [active, pending],
      account: active,
      providers: [
        connected(active.provider),
        { type: pending.provider, status: WalletProviderStatus.Pending },
      ],
      open: true,
      meta,
      restoreStates: { [pending.provider]: WalletRestoreState.Restoring },
    })

    useWeb3Connect.getState().cancelPendingProvider(pending.provider)
    useWeb3Connect.getState().cancelPendingProvider(active.provider)

    expect(useWeb3Connect.getState()).toMatchObject({
      accounts: [active],
      account: active,
      providers: [connected(active.provider)],
      restoreStates: {},
      open: true,
      meta,
    })
  })
})

describe("legacy connection normalization", () => {
  it("keeps the active connected type even when another type is more recent", () => {
    const active = account(WalletProviderType.Subwallet)
    const evm = account(WalletProviderType.SubwalletEvm)
    const h160 = account(WalletProviderType.SubwalletH160)
    const other = account(WalletProviderType.PolkadotJS)
    useWeb3Connect.setState({
      accounts: [evm, active, h160, other],
      account: active,
      providers: [evm, active, h160, other].map(({ provider }) =>
        connected(provider),
      ),
      recentlyUsedProviders: [evm.provider, h160.provider],
      recentProvider: evm.provider,
      restoreStates: {
        [evm.provider]: WalletRestoreState.Restoring,
        [active.provider]: WalletRestoreState.Restoring,
        [h160.provider]: WalletRestoreState.Unavailable,
      },
    })

    useWeb3Connect.getState().normalizeProviders()

    expect(useWeb3Connect.getState()).toMatchObject({
      account: active,
      accounts: [active, other],
      providers: [connected(active.provider), connected(other.provider)],
      restoreStates: { [active.provider]: WalletRestoreState.Restoring },
    })
  })

  it("chooses each wallet's most recent connected type and ignores disconnected preferences", () => {
    const old = account(WalletProviderType.Subwallet)
    const recent = account(WalletProviderType.SubwalletEvm)
    const talisman = account(WalletProviderType.Talisman)
    const talismanEvm = account(WalletProviderType.TalismanEvm)
    useWeb3Connect.setState({
      accounts: [old, recent, talisman, talismanEvm],
      providers: [old, recent, talisman, talismanEvm].map(({ provider }) =>
        connected(provider),
      ),
      recentlyUsedProviders: [
        WalletProviderType.SubwalletH160,
        recent.provider,
        talismanEvm.provider,
      ],
    })

    useWeb3Connect.getState().normalizeProviders()

    expect(useWeb3Connect.getState().accounts).toEqual([recent, talismanEvm])
    expect(useWeb3Connect.getState().providers).toEqual([
      connected(recent.provider),
      connected(talismanEvm.provider),
    ])
  })

  it("does not treat a newer pending switch as a legacy duplicate to remove", () => {
    const current = account(WalletProviderType.Subwallet)
    useWeb3Connect.setState({
      account: current,
      accounts: [current],
      providers: [
        connected(current.provider),
        {
          type: WalletProviderType.SubwalletEvm,
          status: WalletProviderStatus.Pending,
        },
      ],
    })

    useWeb3Connect.getState().normalizeProviders()

    expect(useWeb3Connect.getState().providers).toEqual([
      connected(current.provider),
      {
        type: WalletProviderType.SubwalletEvm,
        status: WalletProviderStatus.Pending,
      },
    ])
  })
})
