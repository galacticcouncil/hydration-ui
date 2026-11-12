import {
  MutationCache,
  MutationObserver,
  onlineManager,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { setupPortfolioPersistence } from "@/api/portfolio/persistence"
import { hbrCreateBankAccountMutation } from "@/modules/onramp/bank/hooks/hbrQueries"
import {
  hbrSessionAccess,
  useHbrSessionStore,
} from "@/modules/onramp/bank/store/useHbrSessionStore"
import { createHbrService } from "@/modules/onramp/bank/utils/createHbrService"
import { hbrQueryKeys } from "@/modules/onramp/bank/utils/queryKeys"
import { logMutationError, logQueryError } from "@/utils/queryErrorLog"

// IndexedDB stubbed: every write the persister makes is recorded.
const stored = vi.hoisted(() => [] as string[])
vi.mock("@/utils/indexedDB", () => ({
  IndexedDBStores: { PortfolioBalances: "PortfolioBalances" },
  IndexedDBManager: { getInstance: async () => ({}) },
  getItemFromStore: async () => undefined,
  setItemInStore: async (
    _db: unknown,
    _store: string,
    _key: string,
    data: unknown,
  ) => {
    stored.push(
      JSON.stringify(data, (_k, v: unknown) =>
        typeof v === "bigint" ? v.toString() : v,
      ),
    )
  },
  removeItemFromStore: async () => {},
}))
vi.mock("@galacticcouncil/web3-connect", () => ({
  EIP1193_USER_REJECTED: 4001,
  getEip1193ErrorCode: () => null,
}))

const A = "0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed"
const IBAN = "DE89370400440532013000"
const SEPA = {
  clientRequestId: "00000000-0000-4000-8000-0000000000a1",
  rail: "sepa" as const,
  iban: IBAN,
  bic: "COBADEFFXXX",
  address: {
    streetLine1: "Secret Street 1",
    city: "Secret City",
    postalCode: "10115",
    country: "DEU",
  },
}
const tick = (ms = 20) => new Promise((resolve) => setTimeout(resolve, ms))

// The QueryClient and persister exactly as apps/main/src/App.tsx sets them up.
const appClient = async () => {
  const client = new QueryClient({
    queryCache: new QueryCache({ onError: logQueryError }),
    mutationCache: new MutationCache({ onError: logMutationError }),
  })
  client.mount()
  setupPortfolioPersistence(client)
  await tick(10)
  return client
}

beforeEach(() => {
  stored.length = 0
  vi.spyOn(console, "error").mockImplementation(() => {})
  useHbrSessionStore.getState().setSession({
    token: "A".repeat(43),
    h160: A,
    expiresAt: "2099-01-01T00:00:00.000Z",
  })
})
afterEach(() => {
  onlineManager.setOnline(true)
  vi.restoreAllMocks()
})

describe("the portfolio persister never stores HBR data", () => {
  it("an offline bank-account submit is not paused and its details are never persisted", async () => {
    const fetchFn = vi.fn(async () => {
      throw new TypeError("Failed to fetch")
    })
    const service = createHbrService({
      baseUrl: "https://hbr.example.org",
      session: hbrSessionAccess,
      fetchFn,
    })
    const client = await appClient()
    onlineManager.setOnline(false)

    const observer = new MutationObserver(
      client,
      hbrCreateBankAccountMutation(service, client, A),
    )
    void observer.mutate(SEPA).catch(() => {})
    await tick()

    // Not paused: the request was attempted at once and failed as unobserved.
    expect(fetchFn).toHaveBeenCalledTimes(1)
    expect(stored.join("\n")).not.toContain(IBAN)
    expect(stored.join("\n")).not.toContain("Secret Street")
  })

  it("an HBR-keyed mutation that does pause is not persisted either", async () => {
    const client = await appClient()
    onlineManager.setOnline(false)
    const observer = new MutationObserver(client, {
      mutationKey: hbrQueryKeys.mutation(A, "anything"),
      mutationFn: async (_body: unknown) => undefined,
    })
    void observer.mutate(SEPA).catch(() => {})
    await tick()

    expect(observer.getCurrentResult().isPaused).toBe(true)
    expect(stored.join("\n")).not.toContain(IBAN)
  })

  it("other paused mutations are persisted as before", async () => {
    const client = await appClient()
    onlineManager.setOnline(false)
    const observer = new MutationObserver(client, {
      mutationKey: ["portfolio", "something"],
      mutationFn: async (_body: unknown) => undefined,
    })
    void observer.mutate({ marker: "kept-as-before" }).catch(() => {})
    await tick()

    expect(stored.join("\n")).toContain("kept-as-before")
  })
})
