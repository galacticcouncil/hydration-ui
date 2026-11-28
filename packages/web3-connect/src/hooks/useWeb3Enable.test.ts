import { beforeEach, describe, expect, it, vi } from "vitest"

import { WalletProviderType } from "@/config/providers"
import {
  StoredAccount,
  useWeb3Connect,
  WalletProviderStatus,
} from "@/hooks/useWeb3Connect"
import { abandonEnable, useWeb3Enable } from "@/hooks/useWeb3Enable"
import { Wallet, WalletAccount } from "@/types/wallet"
import { AuthError, StaleAttemptError } from "@/utils/errors"

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
  makeWallet(WalletProviderType.PolkadotJS, "Polkadot.js")
  Object.values(WalletProviderType).forEach(abandonEnable)
  useWeb3Connect.setState(initialState, true)
})

describe("connecting a wallet that authorizes no accounts", () => {
  it("does not accept a connection with no authorized accounts", async () => {
    const previous = seedConnected(WalletProviderType.Subwallet)
    const nextWallet = wallets.get(WalletProviderType.PolkadotJS)!
    vi.mocked(nextWallet.getAccounts).mockResolvedValue([])

    await expect(
      useWeb3Enable().enable(nextWallet.provider),
    ).rejects.toBeInstanceOf(AuthError)

    expect(useWeb3Connect.getState().account).toEqual(previous)
    expect(useWeb3Connect.getState().getStatus(previous.provider)).toBe(
      WalletProviderStatus.Connected,
    )
    expect(useWeb3Connect.getState().getStatus(nextWallet.provider)).toBe(
      WalletProviderStatus.Error,
    )
    expect(useWeb3Connect.getState().error).toBe(
      new AuthError(nextWallet).message,
    )
    expect(addressBookAdd).not.toHaveBeenCalled()
    expect(nextWallet.disconnect).toHaveBeenCalled()
    expect(wallets.get(previous.provider)!.disconnect).not.toHaveBeenCalled()
  })

  it("disconnects instead of erroring when disconnectOnError is set", async () => {
    const wallet = wallets.get(WalletProviderType.PolkadotJS)!
    vi.mocked(wallet.getAccounts).mockResolvedValue([])

    await expect(
      useWeb3Enable({ disconnectOnError: true }).enable(wallet.provider),
    ).rejects.toBeInstanceOf(AuthError)

    expect(useWeb3Connect.getState().getStatus(wallet.provider)).toBe(
      WalletProviderStatus.Disconnected,
    )
    expect(useWeb3Connect.getState().accounts).toEqual([])
    expect(wallet.disconnect).toHaveBeenCalled()
  })
})

describe("superseded enable attempts", () => {
  it("lets a later request win when an older wallet prompt resolves last", async () => {
    const wallet = wallets.get(WalletProviderType.PolkadotJS)!
    const gate = deferred()
    vi.mocked(wallet.enable).mockImplementationOnce(() => gate.promise)
    const hook = useWeb3Enable()
    const staleResult = hook
      .enable(wallet.provider)
      .catch((error: unknown) => error)
    await Promise.resolve()

    await hook.enable(wallet.provider)
    gate.resolve()
    const error = await staleResult

    expect(error).toBeInstanceOf(StaleAttemptError)
    expect(useWeb3Connect.getState()).toMatchObject({
      accounts: [{ provider: wallet.provider }],
      providers: [
        { type: wallet.provider, status: WalletProviderStatus.Connected },
      ],
    })
    expect(wallet.getAccounts).toHaveBeenCalledTimes(1)
    expect(wallet.disconnect).not.toHaveBeenCalled()
    expect(addressBookAdd).toHaveBeenCalledTimes(1)
  })

  it("ignores an abandoned request after disconnecting while the extension is open", async () => {
    seedConnected(WalletProviderType.Subwallet)
    const nextWallet = wallets.get(WalletProviderType.PolkadotJS)!
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
    expect(nextWallet.disconnect).toHaveBeenCalled()
    expect(addressBookAdd).not.toHaveBeenCalled()
  })

  it("does not resurrect a restore that finishes after the wallet was disconnected", async () => {
    const previous = seedConnected(WalletProviderType.Subwallet)
    const wallet = wallets.get(previous.provider)!
    const gate = deferred()
    vi.mocked(wallet.restore!).mockImplementation(() => gate.promise)
    const staleResult = useWeb3Enable({ restore: true })
      .enable(previous.provider)
      .catch((error: unknown) => error)
    await Promise.resolve()

    useWeb3Enable().disconnect(previous.provider)
    gate.resolve()

    expect(await staleResult).toBeInstanceOf(StaleAttemptError)
    expect(useWeb3Connect.getState().providers).toEqual([])
    expect(wallet.getAccounts).not.toHaveBeenCalled()
  })
})
