import { beforeEach, describe, expect, it, vi } from "vitest"

import { WalletProviderType } from "@/config/providers"
import {
  StoredAccount,
  useWeb3Connect,
  WalletMode,
  WalletProviderStatus,
  WalletRestoreState,
} from "@/hooks/useWeb3Connect"
import { abandonEnable, useWeb3Enable } from "@/hooks/useWeb3Enable"
import { Wallet, WalletAccount } from "@/types/wallet"
import { AuthError, StaleAttemptError, UserRejectedError } from "@/utils/errors"

const { wallets, addressBookAdd } = vi.hoisted(() => ({
  wallets: new Map<string, Wallet>(),
  addressBookAdd: vi.fn(),
}))

// Run React Query's mutation lifecycle without rendering an unrelated UI tree.
// These callbacks and the Zustand store below are the production implementations.
type MutationLifecycle = {
  mutationFn: (variables: unknown) => Promise<unknown>
  onMutate?: (variables: unknown) => unknown
  onSuccess?: (data: unknown, variables: unknown, context: unknown) => unknown
  onError?: (error: unknown, variables: unknown, context: unknown) => unknown
}
vi.mock("@tanstack/react-query", () => ({
  useMutation: (lifecycle: MutationLifecycle) => ({
    mutateAsync: async (variables: unknown) => {
      const context = await lifecycle.onMutate?.(variables)
      try {
        const data = await lifecycle.mutationFn(variables)
        await lifecycle.onSuccess?.(data, variables, context)
        return data
      } catch (error) {
        await lifecycle.onError?.(error, variables, context)
        throw error
      }
    },
  }),
}))
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useCallback: (callback: unknown) => callback,
}))
vi.mock("zustand/shallow", () => ({
  useShallow: (selector: unknown) => selector,
}))
vi.mock("zustand/middleware", () => ({
  persist: (creator: unknown) => creator,
}))
vi.mock("@/hooks/useWeb3Connect", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./useWeb3Connect")>()
  return {
    ...actual,
    useWeb3Connect: Object.assign(
      (
        selector: (
          state: ReturnType<typeof actual.useWeb3Connect.getState>,
        ) => unknown,
      ) => selector(actual.useWeb3Connect.getState()),
      actual.useWeb3Connect,
    ),
  }
})
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
}))
vi.mock("@/wallets/BaseSubstrateWallet", () => ({
  BaseSubstrateWallet: class {},
}))
vi.mock("@/wallets", () => ({
  getWallet: (provider: WalletProviderType) => wallets.get(provider),
  getWallets: () => [...wallets.values()],
  ExternalWallet: class {},
}))
vi.mock("@/components/address-book/AddressBook.store", () => ({
  useAddressStore: () => ({ add: addressBookAdd }),
}))

const makeWallet = (provider: WalletProviderType, title: string): Wallet => {
  const wallet: Wallet = {
    provider,
    title,
    accessor: provider,
    logo: "",
    installUrl: "",
    installed: true,
    enabled: true,
    signer: undefined,
    enable: vi.fn(async () => {}),
    restore: vi.fn(async () => {}),
    disconnect: vi.fn(),
    getAccounts: vi.fn(async () => [
      { provider, address: `${provider}-address`, name: title },
    ]),
    subscribeAccounts: vi.fn(() => () => {}),
    transformError: (error) => error,
  }
  wallets.set(provider, wallet)
  return wallet
}
const storedAccount = (provider: WalletProviderType): StoredAccount => ({
  provider,
  address: `${provider}-address`,
  rawAddress: `${provider}-address`,
  publicKey: `${provider}-address-public-key`,
  name: "Existing account",
})
const deferred = () => {
  let resolve!: () => void
  const promise = new Promise<void>((finish) => {
    resolve = finish
  })
  return { promise, resolve }
}
const seedConnected = (provider: WalletProviderType) => {
  const account = storedAccount(provider)
  useWeb3Connect.setState({
    accounts: [account],
    account,
    providers: [{ type: provider, status: WalletProviderStatus.Connected }],
  })
  return account
}
const initialState = useWeb3Connect.getState()

beforeEach(() => {
  vi.clearAllMocks()
  wallets.clear()
  makeWallet(WalletProviderType.Subwallet, "SubWallet")
  makeWallet(WalletProviderType.SubwalletEvm, "SubWallet")
  makeWallet(WalletProviderType.SubwalletH160, "SubWallet")
  makeWallet(WalletProviderType.PolkadotJS, "Polkadot.js")
  Object.values(WalletProviderType).forEach(abandonEnable)
  useWeb3Connect.setState(initialState, true)
})

describe("switching a wallet account type", () => {
  it("keeps the previous type until the replacement is ready, then disconnects it", async () => {
    const previous = seedConnected(WalletProviderType.Subwallet)
    const oldWallet = wallets.get(previous.provider)!
    const nextWallet = wallets.get(WalletProviderType.SubwalletEvm)!
    const gate = deferred()
    vi.mocked(nextWallet.enable).mockImplementation(() => gate.promise)
    const meta = { title: "Select source", hideExternalWallet: true }
    useWeb3Connect.setState({ open: true, mode: WalletMode.EVM, meta })
    const hook = useWeb3Enable()

    const request = hook.enable(nextWallet.provider)
    await Promise.resolve()

    expect(useWeb3Connect.getState().accounts).toEqual([previous])
    expect(useWeb3Connect.getState().getStatus(previous.provider)).toBe(
      WalletProviderStatus.Connected,
    )
    expect(oldWallet.disconnect).not.toHaveBeenCalled()

    gate.resolve()
    await request

    expect(useWeb3Connect.getState()).toMatchObject({
      account: { provider: nextWallet.provider },
      accounts: [{ provider: nextWallet.provider }],
      providers: [
        { type: nextWallet.provider, status: WalletProviderStatus.Connected },
      ],
      open: true,
      mode: WalletMode.EVM,
      meta,
    })
    expect(oldWallet.disconnect).toHaveBeenCalledTimes(1)
    expect(addressBookAdd).toHaveBeenCalledTimes(1)
  })

  it("preserves the connected type when the user rejects the new type", async () => {
    const previous = seedConnected(WalletProviderType.Subwallet)
    const nextWallet = wallets.get(WalletProviderType.SubwalletEvm)!
    vi.mocked(nextWallet.enable).mockRejectedValue(
      new UserRejectedError(nextWallet),
    )
    const hook = useWeb3Enable()

    await expect(hook.enable(nextWallet.provider)).rejects.toBeInstanceOf(
      UserRejectedError,
    )

    expect(useWeb3Connect.getState()).toMatchObject({
      account: previous,
      accounts: [previous],
      providers: [
        { type: previous.provider, status: WalletProviderStatus.Connected },
      ],
    })
    expect(wallets.get(previous.provider)!.disconnect).not.toHaveBeenCalled()
    expect(addressBookAdd).not.toHaveBeenCalled()
  })

  it("does not accept a connection with no authorized accounts", async () => {
    const previous = seedConnected(WalletProviderType.Subwallet)
    const nextWallet = wallets.get(WalletProviderType.SubwalletEvm)!
    vi.mocked(nextWallet.getAccounts).mockResolvedValue([])

    await expect(
      useWeb3Enable().enable(nextWallet.provider),
    ).rejects.toBeInstanceOf(AuthError)

    expect(useWeb3Connect.getState().account).toEqual(previous)
    expect(useWeb3Connect.getState().getStatus(previous.provider)).toBe(
      WalletProviderStatus.Connected,
    )
    expect(useWeb3Connect.getState().getStatus(nextWallet.provider)).not.toBe(
      WalletProviderStatus.Connected,
    )
    expect(wallets.get(previous.provider)!.disconnect).not.toHaveBeenCalled()
    expect(addressBookAdd).not.toHaveBeenCalled()
  })

  it("lets a later account-type request win when an older wallet prompt resolves last", async () => {
    seedConnected(WalletProviderType.Subwallet)
    const slower = wallets.get(WalletProviderType.SubwalletEvm)!
    const winner = wallets.get(WalletProviderType.SubwalletH160)!
    const gate = deferred()
    vi.mocked(slower.enable).mockImplementation(() => gate.promise)
    const hook = useWeb3Enable()
    const staleResult = hook
      .enable(slower.provider)
      .catch((error: unknown) => error)
    await Promise.resolve()

    await hook.enable(winner.provider)
    gate.resolve()
    const error = await staleResult

    expect(error).toBeInstanceOf(StaleAttemptError)
    expect(useWeb3Connect.getState()).toMatchObject({
      account: { provider: winner.provider },
      accounts: [{ provider: winner.provider }],
      providers: [
        { type: winner.provider, status: WalletProviderStatus.Connected },
      ],
    })
    expect(slower.getAccounts).not.toHaveBeenCalled()
    expect(slower.disconnect).toHaveBeenCalled()
    expect(addressBookAdd).toHaveBeenCalledTimes(1)
  })

  it("ignores an abandoned request after disconnecting while the extension is open", async () => {
    seedConnected(WalletProviderType.Subwallet)
    const nextWallet = wallets.get(WalletProviderType.SubwalletEvm)!
    const gate = deferred()
    vi.mocked(nextWallet.enable).mockImplementation(() => gate.promise)
    const hook = useWeb3Enable()
    const staleResult = hook
      .enable(nextWallet.provider)
      .catch((error: unknown) => error)
    await Promise.resolve()

    hook.disconnect(nextWallet.provider)
    gate.resolve()

    expect(await staleResult).toBeInstanceOf(StaleAttemptError)
    expect(useWeb3Connect.getState().getStatus(nextWallet.provider)).toBe(
      WalletProviderStatus.Disconnected,
    )
    expect(useWeb3Connect.getState().account?.provider).toBe(
      WalletProviderType.Subwallet,
    )
    expect(nextWallet.getAccounts).not.toHaveBeenCalled()
    expect(addressBookAdd).not.toHaveBeenCalled()
  })
})

describe("restoring a saved connection during a switch", () => {
  it("restores silently without cancelling a newer pending account-type selection", async () => {
    const previous = seedConnected(WalletProviderType.Subwallet)
    const oldWallet = wallets.get(previous.provider)!
    const nextWallet = wallets.get(WalletProviderType.SubwalletEvm)!
    const restoreGate = deferred()
    const connectGate = deferred()
    vi.mocked(oldWallet.restore!).mockImplementation(() => restoreGate.promise)
    vi.mocked(nextWallet.enable).mockImplementation(() => connectGate.promise)
    const restoreRequest = useWeb3Enable({ restore: true, eager: true }).enable(
      previous.provider,
    )
    await Promise.resolve()
    const nextRequest = useWeb3Enable().enable(nextWallet.provider)
    await Promise.resolve()

    restoreGate.resolve()
    await restoreRequest

    expect(oldWallet.enable).not.toHaveBeenCalled()
    expect(oldWallet.restore).toHaveBeenCalledTimes(1)
    expect(useWeb3Connect.getState().getStatus(nextWallet.provider)).toBe(
      WalletProviderStatus.Pending,
    )
    expect(
      useWeb3Connect.getState().restoreStates[previous.provider],
    ).toBeUndefined()

    connectGate.resolve()
    await nextRequest

    expect(useWeb3Connect.getState().providers).toEqual([
      { type: nextWallet.provider, status: WalletProviderStatus.Connected },
    ])
    expect(useWeb3Connect.getState().accounts).toEqual([
      expect.objectContaining({ provider: nextWallet.provider }),
    ])
  })

  it("does not resurrect the old type when its restore finishes after the new connection", async () => {
    const previous = seedConnected(WalletProviderType.Subwallet)
    const oldWallet = wallets.get(previous.provider)!
    const gate = deferred()
    vi.mocked(oldWallet.restore!).mockImplementation(() => gate.promise)
    const staleResult = useWeb3Enable({ restore: true })
      .enable(previous.provider)
      .catch((error: unknown) => error)
    await Promise.resolve()

    await useWeb3Enable().enable(WalletProviderType.SubwalletEvm)
    gate.resolve()

    expect(await staleResult).toBeInstanceOf(StaleAttemptError)
    expect(useWeb3Connect.getState().providers).toEqual([
      {
        type: WalletProviderType.SubwalletEvm,
        status: WalletProviderStatus.Connected,
      },
    ])
    expect(oldWallet.getAccounts).not.toHaveBeenCalled()
  })

  it("retains a temporarily unavailable restore instead of replacing it with another type", async () => {
    const previous = seedConnected(WalletProviderType.Subwallet)
    const oldWallet = wallets.get(previous.provider)!
    const error = new Error("Extension timed out")
    error.name = "TimeoutError"
    vi.mocked(oldWallet.restore!).mockRejectedValue(error)

    await expect(
      useWeb3Enable({ restore: true }).enable(previous.provider),
    ).rejects.toThrow("Extension timed out")

    expect(useWeb3Connect.getState().account).toEqual(previous)
    expect(useWeb3Connect.getState().restoreStates[previous.provider]).toBe(
      WalletRestoreState.Unavailable,
    )
    expect(useWeb3Connect.getState().getStatus(previous.provider)).toBe(
      WalletProviderStatus.Connected,
    )
  })
})
