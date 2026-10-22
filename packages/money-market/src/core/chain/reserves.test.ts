import type { Config } from "@wagmi/core"
import { readContract } from "@wagmi/core"
import { ContractFunctionZeroDataError } from "viem"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  ChainReadError,
  DecodeError,
  getMarket,
  MarketNotDeployedError,
  readReserves,
} from "@/core"

vi.mock("@wagmi/core", () => ({ readContract: vi.fn() }))

const mockedReadContract = vi.mocked(readContract)

const market = getMarket("hydration_v3")
const config = {} as Config

/** One reserve as viem decodes it — mixed-case address, bigint quantities. */
const rawReserve = {
  underlyingAsset: "0x0000000000000000000000000000000000000ABC",
  name: "Hollar",
  symbol: "HOLLAR",
  decimals: 18n,
  aTokenAddress: "0x0000000000000000000000000000000000000001",
  variableDebtTokenAddress: "0x0000000000000000000000000000000000000002",
  interestRateStrategyAddress: "0x0000000000000000000000000000000000000003",
  baseLTVasCollateral: 7500n,
  reserveLiquidationThreshold: 8000n,
  reserveLiquidationBonus: 10500n,
  reserveFactor: 1000n,
  usageAsCollateralEnabled: true,
  borrowingEnabled: true,
  flashLoanEnabled: false,
  isActive: true,
  isFrozen: false,
  isPaused: false,
  liquidityIndex: 1000000000000000000000000000n,
  variableBorrowIndex: 1000000000000000000000000000n,
  liquidityRate: 20000000000000000000000000n,
  variableBorrowRate: 50000000000000000000000000n,
  lastUpdateTimestamp: 1737000000,
  baseVariableBorrowRate: 0n,
  variableRateSlope1: 40000000000000000000000000n,
  variableRateSlope2: 600000000000000000000000000n,
  optimalUsageRatio: 900000000000000000000000000n,
  availableLiquidity: 123456789n,
  totalScaledVariableDebt: 987654321n,
  unbacked: 0n,
  priceInMarketReferenceCurrency: 100000000n,
  supplyCap: 1000000n,
  borrowCap: 500000n,
  debtCeiling: 0n,
  debtCeilingDecimals: 2n,
  isolationModeTotalDebt: 0n,
  borrowableInIsolation: false,
  isSiloedBorrowing: false,
  eModeCategoryId: 0,
  eModeLabel: "",
  eModeLtv: 0,
  eModeLiquidationThreshold: 0,
  eModeLiquidationBonus: 0,
  // Stable-rate fields are still in the on-chain struct and must be ignored.
  stableBorrowRate: 70000000000000000000000000n,
  stableBorrowRateEnabled: false,
}

const rawBaseCurrency = {
  marketReferenceCurrencyUnit: 100000000n,
  marketReferenceCurrencyPriceInUsd: 100000000n,
  networkBaseTokenPriceInUsd: 250000000n,
  networkBaseTokenPriceDecimals: 8,
}

const rawIncentives = [
  {
    underlyingAsset: "0x0000000000000000000000000000000000000ABC",
    aIncentiveData: {
      tokenAddress: "0x0000000000000000000000000000000000000001",
      incentiveControllerAddress: "0x00000000000000000000000000000000000000c0",
      rewardsTokenInformation: [
        {
          rewardTokenSymbol: "HDX",
          rewardTokenAddress: "0x0000000000000000000000000000000000000004",
          rewardOracleAddress: "0x0000000000000000000000000000000000000005",
          emissionPerSecond: 1000000000000n,
          incentivesLastUpdateTimestamp: 1737000000n,
          tokenIncentivesIndex: 42n,
          emissionEndTimestamp: 1740000000n,
          rewardPriceFeed: 2500000n,
          rewardTokenDecimals: 12,
          precision: 18,
          priceFeedDecimals: 8,
        },
      ],
    },
    vIncentiveData: {
      tokenAddress: "0x0000000000000000000000000000000000000002",
      incentiveControllerAddress: "0x00000000000000000000000000000000000000c0",
      rewardsTokenInformation: [],
    },
    // The stable side is returned by the contract and deliberately dropped.
    sIncentiveData: {
      tokenAddress: "0x0000000000000000000000000000000000000006",
      incentiveControllerAddress: "0x00000000000000000000000000000000000000c0",
      rewardsTokenInformation: [],
    },
  },
]

type MockedCall = { functionName: string }

const respondWith = (responses: {
  reserves?: unknown
  incentives?: unknown
  onReserves?: () => never
  onIncentives?: () => never
}) => {
  mockedReadContract.mockImplementation(async (_config, parameters) => {
    const { functionName } = parameters as unknown as MockedCall
    if (functionName === "getReservesData") {
      responses.onReserves?.()
      return responses.reserves
    }
    responses.onIncentives?.()
    return responses.incentives
  })
}

describe("readReserves", () => {
  beforeEach(() => {
    mockedReadContract.mockReset()
  })

  it("decodes reserves, base currency and incentives in one call", async () => {
    respondWith({
      reserves: [[rawReserve], rawBaseCurrency],
      incentives: rawIncentives,
    })

    const result = await readReserves(config, market)

    expect(mockedReadContract).toHaveBeenCalledTimes(2)
    expect(result.reserves).toHaveLength(1)

    const [reserve] = result.reserves
    // bigint is converted at the decode boundary and addresses are lowercased.
    expect(reserve?.underlyingAsset).toBe(
      "0x0000000000000000000000000000000000000abc",
    )
    expect(reserve?.decimals).toBe(18)
    expect(reserve?.liquidityRate).toBe("20000000000000000000000000")
    expect(reserve?.availableLiquidity).toBe("123456789")
    expect(reserve).not.toHaveProperty("stableBorrowRate")

    // The unit is reported, the decimals are derived from it.
    expect(result.baseCurrency).toEqual({
      marketReferenceCurrencyDecimals: 8,
      marketReferenceCurrencyPriceInUsd: "100000000",
      networkBaseTokenPriceInUsd: "250000000",
      networkBaseTokenPriceDecimals: 8,
    })

    const [incentive] = result.incentives
    expect(incentive?.supply.emissions[0]?.emissionPerSecond).toBe(
      "1000000000000",
    )
    expect(incentive?.supply.emissions[0]?.emissionEndTimestamp).toBe(
      1740000000,
    )
    expect(incentive?.variableBorrow.emissions).toEqual([])
    expect(incentive).not.toHaveProperty("sIncentiveData")
  })

  it("returns an empty incentives result normally", async () => {
    respondWith({ reserves: [[rawReserve], rawBaseCurrency], incentives: [] })

    await expect(readReserves(config, market)).resolves.toMatchObject({
      incentives: [],
    })
  })

  it("throws MarketNotDeployedError when a call returns empty data", async () => {
    respondWith({
      incentives: [],
      onReserves: () => {
        throw new ContractFunctionZeroDataError({
          functionName: "getReservesData",
        })
      },
    })

    await expect(readReserves(config, market)).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof MarketNotDeployedError &&
        error.market === "hydration_v3" &&
        error.address === market.addresses.UI_POOL_DATA_PROVIDER,
    )
  })

  it("wraps a transport failure as ChainReadError", async () => {
    const transport = new Error("socket closed")
    respondWith({
      incentives: [],
      onReserves: () => {
        throw transport
      },
    })

    await expect(readReserves(config, market)).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ChainReadError && error.cause === transport,
    )
  })

  it("throws DecodeError, never a ZodError, on an unexpected payload", async () => {
    respondWith({
      reserves: [[{ ...rawReserve, decimals: "eighteen" }], rawBaseCurrency],
      incentives: [],
    })

    await expect(readReserves(config, market)).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof DecodeError &&
        error.name === "DecodeError" &&
        error.path === "[0][0].decimals",
    )
  })
})
