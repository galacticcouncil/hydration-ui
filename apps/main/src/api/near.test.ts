import { afterEach, describe, expect, it, vi } from "vitest"

import { nearAccountQuery } from "./near"

vi.mock("@/api/rpcConfig", () => ({ getDefaultDataEnv: () => "mainnet" }))

const queryAccount = async () => {
  const queryFn = nearAccountQuery("example.near").queryFn
  if (!queryFn) throw new Error("Missing query function")

  return queryFn({ signal: new AbortController().signal } as Parameters<
    typeof queryFn
  >[0])
}

describe("nearAccountQuery", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("accepts an account returned by NEAR RPC", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ result: { amount: "0" } }),
      }),
    )

    await expect(queryAccount()).resolves.toBe(true)
  })

  it("rejects a well-formed account name that does not exist", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ error: { cause: { name: "UNKNOWN_ACCOUNT" } } }),
      }),
    )

    await expect(queryAccount()).resolves.toBe(false)
  })

  it("does not mistake an RPC failure for a missing account", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ error: { cause: { name: "TIMEOUT_ERROR" } } }),
      }),
    )

    await expect(queryAccount()).rejects.toThrow("NEAR account lookup failed")
  })
})
