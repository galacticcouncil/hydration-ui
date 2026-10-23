import {
  formatDestChainAddress,
  HYDRATION_CHAIN_KEY,
} from "@galacticcouncil/utils"
import type { Account } from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useDepositRecipientReadiness } from "@/modules/onramp/deposit/hooks/useDepositRecipientReadiness"

const dependencies = vi.hoisted(() => ({
  watch: vi.fn(),
  useQuery: vi.fn(),
  useXcmProvider: vi.fn(),
  useDepositAccounts: vi.fn(),
  getAssetId: vi.fn(),
  getAsset: vi.fn(),
  requiresEvmBinding: vi.fn(),
}))

// Exercise the hook's decisions without mounting the application or connecting
// wallets/RPCs. Address validation and Hydration address formatting stay real.
vi.mock("react-hook-form", () => ({
  useFormContext: () => ({ watch: dependencies.watch }),
}))
vi.mock("@tanstack/react-query", () => ({
  useQuery: dependencies.useQuery,
}))
vi.mock("@/api/deposit", () => ({
  depositRecipientQuery: (_rpc: unknown, address: string) => ({
    queryKey: ["recipient", address],
  }),
}))
vi.mock("@/api/evm", () => ({
  evmAccountBindingQuery: (_rpc: unknown, address: string) => ({
    queryKey: ["binding", address],
  }),
}))
vi.mock("@/api/xcm", () => ({
  useHydrationAssetId: () => dependencies.getAssetId,
}))
vi.mock("@/modules/onramp/deposit/hooks/useDepositAccounts", () => ({
  useDepositAccounts: dependencies.useDepositAccounts,
}))
vi.mock("@/modules/xcm/transfer/hooks/useXcmProvider", () => ({
  useXcmProvider: dependencies.useXcmProvider,
}))
vi.mock("@/modules/xcm/transfer/utils/transfer", () => ({
  requiresEvmBinding: dependencies.requiresEvmBinding,
}))
vi.mock("@/providers/assetsProvider", () => ({
  useAssets: () => ({ getAsset: dependencies.getAsset }),
}))
vi.mock("@/providers/rpcProvider", () => ({
  useRpcProvider: () => ({}),
}))

const address = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
const account: Account = {
  name: "Alice",
  address,
  rawAddress: address,
  displayAddress: address,
  publicKey: "",
  provider: WalletProviderType.Subwallet,
  canUseOnHydration: true,
}
const arrivingAsset = { key: "usdc", originSymbol: "USDC" }
const route = { destination: { asset: arrivingAsset }, tags: [] }
const queryResult = () => ({
  data: undefined as unknown,
  isSuccess: false,
  isError: false,
  isFetching: false,
  refetch: vi.fn(),
})
let recipient: ReturnType<typeof queryResult>
let binding: ReturnType<typeof queryResult>

beforeEach(() => {
  vi.resetAllMocks()
  recipient = queryResult()
  binding = queryResult()
  dependencies.watch.mockReturnValue([arrivingAsset, arrivingAsset])
  dependencies.useXcmProvider.mockReturnValue({ selectedRoute: route })
  dependencies.useDepositAccounts.mockReturnValue([account])
  dependencies.getAssetId.mockReturnValue("10")
  dependencies.getAsset.mockReturnValue({ id: "10", isSufficient: true })
  dependencies.requiresEvmBinding.mockReturnValue(false)
  dependencies.useQuery.mockImplementation(
    ({ queryKey }: { queryKey: string[] }) =>
      queryKey[0] === "recipient" ? recipient : binding,
  )
})

describe("deposit recipient readiness", () => {
  it("waits for a resolved route even when the previous destination asset remains", () => {
    dependencies.useXcmProvider.mockReturnValue({ selectedRoute: null })

    expect(useDepositRecipientReadiness(account).ready).toBe(false)
  })

  it("waits for the arriving asset to resolve to a Hydration asset", () => {
    dependencies.getAsset.mockReturnValue(undefined)

    expect(useDepositRecipientReadiness(account).ready).toBe(false)
  })

  it("allows a sufficient asset for an eligible signer without an activation lookup", () => {
    dependencies.watch.mockReturnValue([null, arrivingAsset])
    const result = useDepositRecipientReadiness(account)
    const hydration = chainsMap.get(HYDRATION_CHAIN_KEY)
    if (!hydration) throw new Error("Missing Hydration chain")

    expect(result.ready).toBe(true)
    expect(result.current).toBe(account)
    expect(result.arrivingAsset).toBe(arrivingAsset)
    expect(result.receiverAddress).toBe(
      formatDestChainAddress(account.rawAddress, hydration),
    )
    expect(result.needsAccountCheck).toBe(false)
    expect(dependencies.useDepositAccounts).toHaveBeenCalledWith({
      signersOnly: true,
    })
  })

  it("blocks a non-sufficient asset when the recipient has no provider or sufficient account", () => {
    dependencies.getAsset.mockReturnValue({ id: "10", isSufficient: false })
    recipient.data = { providers: 0, sufficients: 0 }
    recipient.isSuccess = true

    const result = useDepositRecipientReadiness(account)

    expect(result.needsActivation).toBe(true)
    expect(result.canContinue).toBe(false)
    expect(result.ready).toBe(false)
  })

  it.each([
    { providers: 1, sufficients: 0 },
    { providers: 0, sufficients: 1 },
  ])("allows an activated account with %o", (activation) => {
    dependencies.getAsset.mockReturnValue({ id: "10", isSufficient: false })
    recipient.data = activation
    recipient.isSuccess = true

    expect(useDepositRecipientReadiness(account).ready).toBe(true)
  })

  it("keeps the native asset usable without requiring account activation", () => {
    dependencies.getAssetId.mockReturnValue("0")
    dependencies.getAsset.mockReturnValue({ id: "0", isSufficient: false })

    const result = useDepositRecipientReadiness(account)

    expect(result.needsAccountCheck).toBe(false)
    expect(result.ready).toBe(true)
  })

  it("blocks a failed activation lookup and retries only the required lookup", () => {
    dependencies.getAsset.mockReturnValue({ id: "10", isSufficient: false })
    recipient.isError = true

    const result = useDepositRecipientReadiness(account)

    expect(result.readinessError).toBe(true)
    expect(result.ready).toBe(false)
    result.retry()
    expect(recipient.refetch).toHaveBeenCalledOnce()
    expect(binding.refetch).not.toHaveBeenCalled()
  })

  it.each([
    { status: "pending", data: undefined, fetching: true, allowed: false },
    { status: "unbound", data: false, fetching: false, allowed: false },
    { status: "bound", data: true, fetching: false, allowed: true },
  ])(
    "requires a positive binding result for a Wormhole SS58 recipient: $status",
    ({ data, fetching, allowed }) => {
      const wormholeRoute = { ...route, tags: ["Wormhole"] }
      dependencies.useXcmProvider.mockReturnValue({
        selectedRoute: wormholeRoute,
      })
      dependencies.requiresEvmBinding.mockReturnValue(true)
      binding.data = data
      binding.isSuccess = data !== undefined
      binding.isFetching = fetching

      const result = useDepositRecipientReadiness(account)

      expect(dependencies.requiresEvmBinding).toHaveBeenCalledWith(
        wormholeRoute,
        chainsMap.get(HYDRATION_CHAIN_KEY),
        result.receiverAddress,
      )
      expect(dependencies.useQuery).toHaveBeenCalledWith({
        queryKey: ["binding", result.receiverAddress],
      })
      expect(result.bindingActivation).toBe(data === false)
      expect(result.ready).toBe(allowed)
      expect(result.isFetching).toBe(fetching)
    },
  )

  it("blocks and retries a failed binding lookup", () => {
    dependencies.requiresEvmBinding.mockReturnValue(true)
    binding.isError = true

    const result = useDepositRecipientReadiness(account)

    expect(result.readinessError).toBe(true)
    expect(result.ready).toBe(false)
    result.retry()
    expect(binding.refetch).toHaveBeenCalledOnce()
    expect(recipient.refetch).not.toHaveBeenCalled()
  })

  it("blocks inline confirmation when a cached positive binding result fails to refresh", () => {
    dependencies.requiresEvmBinding.mockReturnValue(true)
    binding.data = true
    binding.isError = true

    const result = useDepositRecipientReadiness(account)

    expect(result.readinessError).toBe(true)
    expect(result.canContinue).toBe(true)
    expect(result.ready).toBe(false)
  })

  it("invalidates a previously selected receiver when its signer disconnects", () => {
    dependencies.useDepositAccounts.mockReturnValue([])

    const result = useDepositRecipientReadiness(account)

    expect(result.eligibleAccounts).toEqual([])
    expect(result.current).toBeNull()
    expect(result.receiverAddress).toBe("")
    expect(result.canContinue).toBe(false)
    expect(result.ready).toBe(false)
  })

  it.each([
    { ...account, canUseOnHydration: false },
    { ...account, rawAddress: "invalid-address" },
    { ...account, provider: WalletProviderType.Talisman },
  ])("rejects an ineligible or unshared recipient: %o", (candidate) => {
    const result = useDepositRecipientReadiness(candidate)

    expect(result.eligible(candidate)).toBe(false)
    expect(result.current).toBeNull()
    expect(result.ready).toBe(false)
  })
})
