import type { Config } from "@wagmi/core"
import { readContract } from "@wagmi/core"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { DecodeError, getMarket, readHollarFacilitator } from "@/core"

vi.mock("@wagmi/core", () => ({ readContract: vi.fn() }))

const mockedReadContract = vi.mocked(readContract)

const market = getMarket("hydration_v3")
const config = {} as Config

const A_TOKEN = "0x8C0f3b9602374198974d2B2679d14a386f5b108e"

/** Answers the pool's reserve read with `A_TOKEN`, the bucket read with `bucket`. */
const mockChain = (bucket: unknown) =>
  mockedReadContract.mockImplementation(async (_config, { functionName }) =>
    functionName === "getReserveData" ? { aTokenAddress: A_TOKEN } : bucket,
  )

const bucket = (level: bigint, maxCapacity: bigint) => [maxCapacity, level]

describe("readHollarFacilitator", () => {
  beforeEach(() => {
    mockedReadContract.mockReset()
  })

  it("reports the bucket in human units", async () => {
    mockChain(bucket(11_790_000n * 10n ** 18n + 5n, 13_000_000n * 10n ** 18n))

    await expect(readHollarFacilitator(config, market)).resolves.toEqual({
      level: "11790000.000000000000000005",
      maxCapacity: "13000000",
    })
  })

  it("reads the bucket of the market's own Hollar aToken", async () => {
    mockChain(bucket(0n, 0n))

    await readHollarFacilitator(config, market)

    expect(mockedReadContract).toHaveBeenCalledWith(
      config,
      expect.objectContaining({
        address: market.addresses.POOL,
        functionName: "getReserveData",
        args: [market.addresses.HOLLAR_TOKEN],
      }),
    )
    expect(mockedReadContract).toHaveBeenCalledWith(
      config,
      expect.objectContaining({
        address: market.addresses.HOLLAR_TOKEN,
        functionName: "getFacilitatorBucket",
        args: [A_TOKEN.toLowerCase()],
      }),
    )
  })

  it("throws DecodeError, never a ZodError, on an unexpected payload", async () => {
    mockChain(["x"])

    await expect(readHollarFacilitator(config, market)).rejects.toBeInstanceOf(
      DecodeError,
    )
  })
})
