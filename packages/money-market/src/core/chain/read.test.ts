import {
  ContractFunctionExecutionError,
  ContractFunctionZeroDataError,
} from "viem"
import { describe, expect, it } from "vitest"

import { ChainReadError, getMarket, MarketNotDeployedError } from "@/core"
import { chainRead } from "@/core/chain/read"

const market = getMarket("hydration_v3")
const address = market.addresses.UI_POOL_DATA_PROVIDER

describe("chainRead", () => {
  it("returns what the call returned", async () => {
    await expect(
      chainRead(market, address, "reserves", async () => 42),
    ).resolves.toBe(42)
  })

  it("throws MarketNotDeployedError when the call returns empty data", async () => {
    const zeroData = new ContractFunctionZeroDataError({
      functionName: "getReservesData",
    })

    await expect(
      chainRead(market, address, "reserves", () => Promise.reject(zeroData)),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof MarketNotDeployedError &&
        error.market === "hydration_v3" &&
        error.address === address,
    )
  })

  it("finds empty data nested inside viem's execution error", async () => {
    const nested = new ContractFunctionExecutionError(
      new ContractFunctionZeroDataError({ functionName: "getReservesData" }),
      { abi: [], functionName: "getReservesData" },
    )

    await expect(
      chainRead(market, address, "reserves", () => Promise.reject(nested)),
    ).rejects.toBeInstanceOf(MarketNotDeployedError)
  })

  it("wraps any other failure as ChainReadError", async () => {
    const transport = new Error("socket closed")

    await expect(
      chainRead(market, address, "reserves", () => Promise.reject(transport)),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ChainReadError && error.cause === transport,
    )
  })
})
