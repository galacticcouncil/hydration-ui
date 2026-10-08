import { describe, expect, it } from "vitest"

import {
  AdjustedReserve,
  gatherAdjustedApys,
  GatherAdjustedApysInput,
  vaultAprReading,
} from "@/modules/money-market-v2/adjustedApys"
import { ConstituentFeed } from "@/modules/money-market-v2/constituents"

const VDOT = "15"
const POOL = "690"
const ADOT = "1001"
const DOT = "5"
const BIL = "550"

const VDOT_ADDRESS = "0x000000000000000000000000000000010000000f"
const POOL_ADDRESS = "0x00000000000000000000000000000001000002b2"
const BIL_ADDRESS = "0x0000000000000000000000000000000100000226"

const feed = (
  kind: ConstituentFeed["kind"],
  reading: ConstituentFeed["reading"],
): ConstituentFeed => ({ kind, reading })

const knownFeed = (kind: ConstituentFeed["kind"], apy: string) =>
  feed(kind, {
    status: "known",
    reading: { apy, asOf: 1_700_000_000_000 },
  })

const vdot: AdjustedReserve = {
  assetId: VDOT,
  address: VDOT_ADDRESS,
  reserve: {
    supplyApy: "0.0124",
    variableBorrowApy: "0.012",
    borrowingEnabled: true,
    supplyIncentives: [],
  },
}

const pool: AdjustedReserve = {
  assetId: POOL,
  address: POOL_ADDRESS,
  reserve: {
    supplyApy: "0",
    variableBorrowApy: "0",
    borrowingEnabled: false,
    supplyIncentives: [],
  },
  poolAssets: [
    { assetId: VDOT, proportion: "0.6" },
    { assetId: ADOT, underlyingAssetId: DOT, proportion: "0.4" },
  ],
  lpFee: { status: "known", apy: "0.004" },
}

const bil: AdjustedReserve = {
  assetId: BIL,
  address: BIL_ADDRESS,
  reserve: {
    supplyApy: "0.01",
    variableBorrowApy: "0.03",
    borrowingEnabled: true,
    supplyIncentives: [],
  },
  vault: { status: "known", apr: "0.11" },
}

const input = (
  overrides: Partial<GatherAdjustedApysInput>,
): GatherAdjustedApysInput => ({
  reserves: [],
  hydrationSupplyApys: {
    status: "known",
    apys: new Map([
      [VDOT, "0.02"],
      [DOT, "0.03"],
    ]),
  },
  poolsLoading: false,
  feeds: new Map([[VDOT, knownFeed("stake", "0.05")]]),
  ...overrides,
})

const total = (rate: { status: string; total?: string } | undefined) =>
  rate?.status === "known" ? Number(rate.total) : rate?.status

describe("vaultAprReading", () => {
  it("is loading until the first fetch has finished", () => {
    // the placeholder `initialData` reports success before anything is read
    expect(
      vaultAprReading({
        data: { apr: 18 },
        isFetched: false,
        isSuccess: true,
      }),
    ).toEqual({ status: "loading" })
  })

  it("is the fetched APR as a fraction", () => {
    expect(
      vaultAprReading({
        data: { apr: 11.25 },
        isFetched: true,
        isSuccess: true,
      }),
    ).toEqual({ status: "known", apr: "0.1125" })
  })

  it("is unavailable when the fetch failed, placeholder or not", () => {
    expect(
      vaultAprReading({
        data: { apr: 18 },
        isFetched: true,
        isSuccess: false,
      }),
    ).toEqual({ status: "unavailable" })
  })

  it("is unavailable for a value that is not a number", () => {
    expect(
      vaultAprReading({
        data: { apr: NaN },
        isFetched: true,
        isSuccess: true,
      }),
    ).toEqual({ status: "unavailable" })
  })
})

describe("gatherAdjustedApys", () => {
  it("is empty when no adjusted reserve is listed", () => {
    expect(gatherAdjustedApys(input({})).size).toBe(0)
  })

  it("keys each entry by the reserve's address", () => {
    const apys = gatherAdjustedApys(input({ reserves: [vdot, pool, bil] }))

    expect([...apys.keys()]).toEqual([VDOT_ADDRESS, POOL_ADDRESS, BIL_ADDRESS])
  })

  it("composes a plain asset from its own rate and feed", () => {
    const apy = gatherAdjustedApys(input({ reserves: [vdot] })).get(
      VDOT_ADDRESS,
    )

    expect(total(apy?.supply)).toBeCloseTo(0.0624, 10)
    expect(total(apy?.borrow)).toBeCloseTo(0.062, 10)
  })

  it("holds both sides of a plain asset while its feed loads", () => {
    const apy = gatherAdjustedApys(
      input({
        reserves: [vdot],
        feeds: new Map([[VDOT, feed("stake", { status: "loading" })]]),
      }),
    ).get(VDOT_ADDRESS)

    expect(apy).toEqual({
      supply: { status: "loading" },
      borrow: { status: "loading" },
    })
  })

  it("reports a plain asset unavailable when its feed is", () => {
    const apy = gatherAdjustedApys(
      input({
        reserves: [vdot],
        feeds: new Map([[VDOT, feed("stake", { status: "unavailable" })]]),
      }),
    ).get(VDOT_ADDRESS)

    expect(apy).toEqual({
      supply: { status: "unavailable" },
      borrow: { status: "unavailable" },
    })
  })

  it("does not make a plain asset wait on pool or hydration_v3 reads", () => {
    const apy = gatherAdjustedApys(
      input({
        reserves: [vdot],
        poolsLoading: true,
        hydrationSupplyApys: { status: "loading" },
      }),
    ).get(VDOT_ADDRESS)

    expect(total(apy?.supply)).toBeCloseTo(0.0624, 10)
    expect(total(apy?.borrow)).toBeCloseTo(0.062, 10)
  })

  it("composes a pool share from its constituents and LP fee", () => {
    const apy = gatherAdjustedApys(input({ reserves: [pool] })).get(
      POOL_ADDRESS,
    )

    // 0.6 x (0.02 + 0.05) + 0.4 x 0.03 + 0.004
    expect(total(apy?.supply)).toBeCloseTo(0.058, 10)
    expect(apy?.borrow).toBeUndefined()
  })

  it.each<[string, Partial<GatherAdjustedApysInput>]>([
    ["pool proportions", { poolsLoading: true }],
    ["hydration_v3 rates", { hydrationSupplyApys: { status: "loading" } }],
    [
      "a pool asset's feed",
      { feeds: new Map([[VDOT, feed("stake", { status: "loading" })]]) },
    ],
  ])("holds a pool share while %s load", (_, overrides) => {
    const apy = gatherAdjustedApys(
      input({ reserves: [pool], ...overrides }),
    ).get(POOL_ADDRESS)

    expect(apy).toEqual({ supply: { status: "loading" } })
  })

  it("holds a pool share while its LP fee loads", () => {
    const apy = gatherAdjustedApys(
      input({ reserves: [{ ...pool, lpFee: { status: "loading" } }] }),
    ).get(POOL_ADDRESS)

    expect(apy).toEqual({ supply: { status: "loading" } })
  })

  it("reports a pool share unavailable when its LP fee is", () => {
    const apy = gatherAdjustedApys(
      input({ reserves: [{ ...pool, lpFee: { status: "unavailable" } }] }),
    ).get(POOL_ADDRESS)

    expect(apy).toEqual({ supply: { status: "unavailable" } })
  })

  it("reports a pool share unavailable without hydration_v3 rates", () => {
    const apy = gatherAdjustedApys(
      input({
        reserves: [pool],
        hydrationSupplyApys: { status: "unavailable" },
      }),
    ).get(POOL_ADDRESS)

    expect(apy).toEqual({ supply: { status: "unavailable" } })
  })

  it("reports a pool share unavailable when a proportion is missing", () => {
    const apy = gatherAdjustedApys(
      input({
        reserves: [
          {
            ...pool,
            poolAssets: [
              { assetId: VDOT },
              { assetId: ADOT, underlyingAssetId: DOT },
            ],
          },
        ],
      }),
    ).get(POOL_ADDRESS)

    expect(apy).toEqual({ supply: { status: "unavailable" } })
  })

  it("reports a pool share unavailable when its assets are not listed", () => {
    const apy = gatherAdjustedApys(
      input({ reserves: [{ ...pool, poolAssets: [] }] }),
    ).get(POOL_ADDRESS)

    expect(apy).toEqual({ supply: { status: "unavailable" } })
  })

  it("supplies the vault's reserve at the vault APR alone", () => {
    const apy = gatherAdjustedApys(input({ reserves: [bil] })).get(BIL_ADDRESS)

    expect(apy?.supply).toEqual({
      status: "known",
      total: "0.11",
      parts: [{ kind: "vault", rate: "0.11" }],
    })
    expect(total(apy?.borrow)).toBeCloseTo(0.03, 10)
  })

  it("holds only the supply side while the vault loads", () => {
    const apy = gatherAdjustedApys(
      input({ reserves: [{ ...bil, vault: { status: "loading" } }] }),
    ).get(BIL_ADDRESS)

    expect(apy?.supply).toEqual({ status: "loading" })
    expect(total(apy?.borrow)).toBeCloseTo(0.03, 10)
  })

  it("reports the vault's supply unavailable when the read failed", () => {
    const apy = gatherAdjustedApys(
      input({ reserves: [{ ...bil, vault: { status: "unavailable" } }] }),
    ).get(BIL_ADDRESS)

    expect(apy?.supply).toEqual({ status: "unavailable" })
    expect(total(apy?.borrow)).toBeCloseTo(0.03, 10)
  })
})
