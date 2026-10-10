import { describe, expect, it } from "vitest"

import {
  adjustedApy,
  AdjustedApyInput,
  ApyRate,
  isNetApyLoading,
  NetApyRow,
  ReserveApy,
  reserveApy,
  toNetApyPositions,
} from "@/modules/money-market-v2/effectiveApy"

const UNAVAILABLE = { status: "unavailable" }

const incentive = (rewardApr: string) => ({
  rewardTokenAddress: "0x0000000000000000000000000000000000000001" as const,
  rewardTokenSymbol: "HDX",
  incentiveControllerAddress:
    "0x0000000000000000000000000000000000000002" as const,
  rewardApr,
  rewardPriceInUsd: "0.01",
})

const reserve = (
  overrides: Partial<AdjustedApyInput["reserve"]> = {},
): AdjustedApyInput["reserve"] => ({
  supplyApy: "0.0124",
  variableBorrowApy: "0.0120",
  borrowingEnabled: true,
  supplyIncentives: [incentive("0.01")],
  ...overrides,
})

const VDOT = "15"

const plainAsset = (feedApy: string | null): AdjustedApyInput => ({
  reserve: reserve(),
  constituents: [
    {
      assetId: VDOT,
      proportion: "1",
      supplyApy: "0.0124",
      feed: { kind: "stake", apy: feedApy },
    },
  ],
  lpFeeApy: undefined,
  vaultApr: undefined,
})

const poolShare = (
  overrides: Partial<AdjustedApyInput> = {},
): AdjustedApyInput => ({
  reserve: reserve({ supplyApy: "0", borrowingEnabled: false }),
  constituents: [
    {
      assetId: "A",
      proportion: "0.6",
      supplyApy: "0.02",
      feed: { kind: "nativeYield", apy: "0.05" },
    },
    { assetId: "B", proportion: "0.4", supplyApy: "0.03" },
  ],
  lpFeeApy: "0.004",
  vaultApr: undefined,
  ...overrides,
})

const vault = (vaultApr: string | null): AdjustedApyInput => ({
  reserve: reserve({ borrowingEnabled: false }),
  constituents: [{ assetId: "BIL", proportion: "1", supplyApy: "0.0124" }],
  lpFeeApy: undefined,
  vaultApr,
})

const sumOfParts = (rate: ApyRate | undefined) => {
  if (rate?.status !== "known") throw new Error("rate is not known")

  return rate.parts.reduce((acc, part) => acc + Number(part.rate), 0)
}

describe("adjustedApy", () => {
  it("adds the feed and incentives to a plain asset's supply, and the feed alone to its borrow", () => {
    expect(adjustedApy(plainAsset("0.0336"))).toEqual({
      supply: {
        status: "known",
        total: "0.056",
        parts: [
          { kind: "base", assetId: VDOT, rate: "0.0124" },
          { kind: "stake", assetId: VDOT, rate: "0.0336" },
          { kind: "incentive", assetId: "1", rate: "0.01" },
        ],
      },
      borrow: {
        status: "known",
        total: "0.0456",
        parts: [
          { kind: "base", rate: "0.012" },
          { kind: "stake", assetId: VDOT, rate: "0.0336" },
        ],
      },
    })
  })

  it("makes supply and borrow unavailable when a plain asset's feed is unavailable", () => {
    expect(adjustedApy(plainAsset(null))).toEqual({
      supply: UNAVAILABLE,
      borrow: UNAVAILABLE,
    })
  })

  it("weights a pool share's constituents and adds the LP fee and incentives, with no borrow", () => {
    expect(adjustedApy(poolShare())).toEqual({
      supply: {
        status: "known",
        total: "0.068",
        parts: [
          { kind: "base", assetId: "A", rate: "0.012" },
          { kind: "nativeYield", assetId: "A", rate: "0.03" },
          { kind: "base", assetId: "B", rate: "0.012" },
          { kind: "lpFee", rate: "0.004" },
          { kind: "incentive", assetId: "1", rate: "0.01" },
        ],
      },
    })
  })

  it("is unavailable for a pool share whose LP fee is unavailable", () => {
    expect(adjustedApy(poolShare({ lpFeeApy: null }))).toEqual({
      supply: UNAVAILABLE,
    })
  })

  it("is unavailable for a pool share with a missing proportion, with no equal split", () => {
    const { constituents } = poolShare()

    expect(
      adjustedApy(
        poolShare({
          constituents: constituents.map((constituent) => ({
            ...constituent,
            proportion: undefined,
          })),
        }),
      ),
    ).toEqual({ supply: UNAVAILABLE })
  })

  it("is the vault APR alone for the vault's reserve", () => {
    expect(adjustedApy(vault("0.0431"))).toEqual({
      supply: {
        status: "known",
        total: "0.0431",
        parts: [{ kind: "vault", rate: "0.0431" }],
      },
    })
  })

  it("is unavailable when the vault read failed", () => {
    expect(adjustedApy(vault(null))).toEqual({ supply: UNAVAILABLE })
  })

  it("has no borrow entry for a non-borrowable reserve", () => {
    const input = plainAsset("0.0336")
    const result = adjustedApy({
      ...input,
      reserve: reserve({ borrowingEnabled: false }),
    })

    expect(result.supply.status).toBe("known")
    expect("borrow" in result).toBe(false)
  })

  it("keeps the borrow side known when only a supply input is unavailable", () => {
    const input = plainAsset("0.0336")

    expect(adjustedApy({ ...input, lpFeeApy: null })).toMatchObject({
      supply: UNAVAILABLE,
      borrow: { status: "known", total: "0.0456" },
    })
    expect(adjustedApy({ ...input, vaultApr: null })).toMatchObject({
      supply: UNAVAILABLE,
      borrow: { status: "known", total: "0.0456" },
    })
  })

  it("omits the base part of a constituent with no rate and keeps a zero one", () => {
    const result = adjustedApy(
      poolShare({
        constituents: [
          { assetId: "A", proportion: "0.5", supplyApy: "0" },
          { assetId: "B", proportion: "0.5" },
        ],
      }),
    )

    expect(result.supply).toEqual({
      status: "known",
      total: "0.014",
      parts: [
        { kind: "base", assetId: "A", rate: "0" },
        { kind: "lpFee", rate: "0.004" },
        { kind: "incentive", assetId: "1", rate: "0.01" },
      ],
    })
  })

  it("returns a total equal to the sum of its parts, in fixed-point notation", () => {
    const { supply, borrow } = adjustedApy(plainAsset("0.0336"))
    const pool = adjustedApy(poolShare()).supply

    for (const rate of [supply, borrow, pool]) {
      if (rate?.status !== "known") throw new Error("rate is not known")

      expect(Number(rate.total)).toBeCloseTo(sumOfParts(rate), 10)
    }

    const tiny = adjustedApy({
      ...plainAsset("0.0000000001"),
      reserve: reserve({ supplyIncentives: [incentive("1e-9")] }),
    }).supply

    expect(tiny).toMatchObject({ status: "known", total: "0.0124000011" })
    expect(JSON.stringify(tiny)).not.toMatch(/e-/)
  })
})

describe("reserveApy", () => {
  it("is the base supply APY and the base borrow APY for a reserve without incentives", () => {
    expect(reserveApy(reserve({ supplyIncentives: [] }))).toEqual({
      supply: {
        status: "known",
        total: "0.0124",
        parts: [{ kind: "base", rate: "0.0124" }],
      },
      borrow: {
        status: "known",
        total: "0.012",
        parts: [{ kind: "base", rate: "0.012" }],
      },
    })
  })

  it("adds one incentive part per supply incentive, and none to the borrow", () => {
    const result = reserveApy(
      reserve({ supplyIncentives: [incentive("0.01"), incentive("0.005")] }),
    )

    expect(result.supply).toEqual({
      status: "known",
      total: "0.0274",
      parts: [
        { kind: "base", rate: "0.0124" },
        { kind: "incentive", assetId: "1", rate: "0.01" },
        { kind: "incentive", assetId: "1", rate: "0.005" },
      ],
    })
    expect(result.borrow).toEqual({
      status: "known",
      total: "0.012",
      parts: [{ kind: "base", rate: "0.012" }],
    })
  })

  it("has no borrow for a reserve that is not borrowable", () => {
    const result = reserveApy(reserve({ borrowingEnabled: false }))

    expect(result.supply.status).toBe("known")
    expect(result).not.toHaveProperty("borrow")
  })

  it("returns the adjusted entry as is", () => {
    const adjusted: ReserveApy = {
      supply: { status: "unavailable" },
      borrow: { status: "loading" },
    }

    expect(reserveApy(reserve(), adjusted)).toBe(adjusted)
  })
})

const knownRate = (total: string): ApyRate => ({
  status: "known",
  total,
  parts: [{ kind: "base", rate: total }],
})

const row = (
  suppliedUsd: string,
  borrowedUsd: string,
  apy: ReserveApy,
  borrowIncentives: string[] = [],
): NetApyRow => ({
  position: {
    underlyingBalanceUsd: suppliedUsd,
    variableBorrowsUsd: borrowedUsd,
  },
  reserve: { borrowIncentives: borrowIncentives.map(incentive) },
  apy,
})

describe("toNetApyPositions", () => {
  it("maps the USD amounts and the totals of both sides", () => {
    expect(
      toNetApyPositions([
        row("1000", "400", {
          supply: knownRate("0.056"),
          borrow: knownRate("0.0456"),
        }),
      ]),
    ).toEqual([
      {
        suppliedUsd: "1000",
        borrowedUsd: "400",
        supplyRate: "0.056",
        borrowRate: "0.0456",
        borrowRewardRate: "0",
      },
    ])
  })

  it("gives a null supply rate when the supply is unavailable", () => {
    const [position] = toNetApyPositions([
      row("1000", "0", {
        supply: { status: "unavailable" },
        borrow: knownRate("0.03"),
      }),
    ])

    expect(position).toMatchObject({ supplyRate: null, borrowRate: "0.03" })
  })

  it("gives a null borrow rate when the borrow is unavailable or absent", () => {
    const positions = toNetApyPositions([
      row("0", "100", {
        supply: knownRate("0.02"),
        borrow: { status: "unavailable" },
      }),
      row("100", "0", { supply: knownRate("0.02") }),
    ])

    expect(positions.map(({ borrowRate }) => borrowRate)).toEqual([null, null])
  })

  it("sums the borrow incentives into the borrow reward rate, for an adjusted reserve too", () => {
    const adjusted = adjustedApy(plainAsset("0.0336"))
    const [position] = toNetApyPositions([
      row("0", "100", adjusted, ["0.01", "0.0025"]),
    ])

    expect(position).toMatchObject({
      borrowRate: "0.0456",
      borrowRewardRate: "0.0125",
    })
  })
})

describe("isNetApyLoading", () => {
  const LOADING: ApyRate = { status: "loading" }

  it("is true when a held supply has a loading supply rate", () => {
    expect(
      isNetApyLoading([
        row("100", "0", { supply: knownRate("0.02") }),
        row("100", "0", { supply: LOADING, borrow: knownRate("0.03") }),
      ]),
    ).toBe(true)
  })

  it("is true when a held borrow has a loading borrow rate", () => {
    expect(
      isNetApyLoading([
        row("0", "100", { supply: knownRate("0.02"), borrow: LOADING }),
      ]),
    ).toBe(true)
  })

  it("ignores a loading rate on a side that is not held", () => {
    expect(
      isNetApyLoading([
        row("0", "100", { supply: LOADING, borrow: knownRate("0.03") }),
        row("100", "0", { supply: knownRate("0.02"), borrow: LOADING }),
        row("0", "0", { supply: LOADING, borrow: LOADING }),
      ]),
    ).toBe(false)
  })

  it("is false for unavailable rates and for no rows", () => {
    expect(isNetApyLoading([])).toBe(false)
    expect(
      isNetApyLoading([
        row("100", "100", {
          supply: { status: "unavailable" },
          borrow: { status: "unavailable" },
        }),
      ]),
    ).toBe(false)
  })
})
