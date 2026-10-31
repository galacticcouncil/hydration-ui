import { describe, expect, it, vi } from "vitest"

import {
  BorrowAssetApyInput,
  toBorrowAssetApyData,
} from "@/api/borrow/borrowAssetApy"
import { ExternalApyType } from "@/api/borrow/externalApys"
import type { TStablepoolDetails } from "@/modules/liquidity/Liquidity.utils"

vi.mock("@/api/neckwork", () => ({}))

const DOT = "5"
const VDOT = "15"
const POOL = "690"
const ADOT = "1001"

const DOT_ADDRESS = "0x0000000000000000000000000000000100000005"
const VDOT_ADDRESS = "0x000000000000000000000000000000010000000f"
const POOL_ADDRESS = "0x00000000000000000000000000000001000002b2"

type Reserve = BorrowAssetApyInput["reserves"][number]

const incentive = (rewardApr: string): Reserve["supplyIncentives"][number] => ({
  rewardTokenAddress: "0x0000000000000000000000000000000100000000",
  rewardTokenSymbol: "HDX",
  incentiveControllerAddress: "0x0000000000000000000000000000000000000001",
  rewardApr,
  rewardPriceInUsd: "0.01",
})

const dotReserve: Reserve = {
  underlyingAsset: DOT_ADDRESS,
  supplyApy: "0.02",
  variableBorrowApy: "0.05",
  supplyIncentives: [],
}

const vdotReserve: Reserve = {
  underlyingAsset: VDOT_ADDRESS,
  supplyApy: "0.0124",
  variableBorrowApy: "0.012",
  supplyIncentives: [incentive("0.01"), incentive("0")],
}

const poolReserve: Reserve = {
  underlyingAsset: POOL_ADDRESS,
  supplyApy: "0",
  variableBorrowApy: "0",
  supplyIncentives: [incentive("0.02")],
}

// vDOT is 60% of the pool, aDOT 40%
const stablepoolData = {
  reserves: [
    { asset_id: Number(VDOT), displayAmount: "600" },
    { asset_id: Number(ADOT), displayAmount: "400" },
  ],
  totalDisplayAmount: "1000",
} as unknown as TStablepoolDetails

const input = (
  overrides: Partial<BorrowAssetApyInput> = {},
): BorrowAssetApyInput => ({
  assetId: VDOT,
  reserves: [dotReserve, vdotReserve, poolReserve],
  externalApys: new Map(),
  stablepoolData: undefined,
  lpAPY: undefined,
  getATokenUnderlyingId: (id) => (id === ADOT ? DOT : undefined),
  getRelatedATokenId: (id) => (id === DOT ? ADOT : undefined),
  ...overrides,
})

describe("toBorrowAssetApyData", () => {
  it("maps a plain reserve to its base APYs and positive incentives", () => {
    const data = toBorrowAssetApyData(input())

    expect(data.assetId).toBe(VDOT)
    expect(data.underlyingAssetsApyData).toEqual([
      { id: VDOT, supplyApy: 1.24, borrowApy: 1.2 },
    ])
    expect(data.incentives).toEqual([
      {
        incentiveAPR: "0.01",
        rewardTokenAddress: "0x0000000000000000000000000000000100000000",
        rewardTokenSymbol: "HDX",
      },
    ])
    expect(data.incentivesNetAPR).toBe(1)
    expect(data.underlyingSupplyApy).toBeCloseTo(1.24)
    expect(data.underlyingBorrowApy).toBeCloseTo(1.2)
    expect(data.supplyMMApy).toBeCloseTo(2.24)
    expect(data.borrowMMApy).toBeCloseTo(2.2)
    expect(data.totalSupplyApy).toBeCloseTo(2.24)
    expect(data.totalBorrowApy).toBeCloseTo(2.2)
    expect(data.lpAPY).toBeUndefined()
  })

  it("composes an adjusted reserve from its pool assets, feeds and LP fee", () => {
    const data = toBorrowAssetApyData(
      input({
        assetId: POOL,
        poolAssetIds: [VDOT, ADOT],
        externalApys: new Map([
          [VDOT, { apyType: ExternalApyType.stake, apy: 5 }],
        ]),
        stablepoolData,
        lpAPY: 0.4,
      }),
    )

    expect(data.underlyingAssetsApyData).toHaveLength(3)
    const [dot, vdot, vdotFeed] = data.underlyingAssetsApyData
    expect(dot?.id).toBe(DOT)
    expect(dot?.supplyApy).toBeCloseTo(0.8)
    expect(dot?.borrowApy).toBeCloseTo(2)
    expect(vdot?.id).toBe(VDOT)
    expect(vdot?.supplyApy).toBeCloseTo(0.744)
    expect(vdot?.borrowApy).toBeCloseTo(0.72)
    expect(vdotFeed).toEqual({
      id: VDOT,
      apyType: ExternalApyType.stake,
      supplyApy: 3,
      borrowApy: 3,
    })

    expect(data.incentivesNetAPR).toBe(2)
    expect(data.underlyingSupplyApy).toBeCloseTo(4.544)
    expect(data.underlyingBorrowApy).toBeCloseTo(5.72)
    expect(data.supplyMMApy).toBeCloseTo(6.544)
    expect(data.borrowMMApy).toBeCloseTo(7.72)
    expect(data.totalSupplyApy).toBeCloseTo(6.944)
    expect(data.totalBorrowApy).toBeCloseTo(8.12)
    expect(data.lpAPY).toBe(0.4)
    expect(data.stablepoolData).toBe(stablepoolData)
  })

  it("nulls every total when a feed is unavailable", () => {
    const data = toBorrowAssetApyData(
      input({
        externalApys: new Map([
          [VDOT, { apyType: ExternalApyType.stake, apy: null }],
        ]),
      }),
    )

    expect(data.underlyingAssetsApyData).toContainEqual({
      id: VDOT,
      apyType: ExternalApyType.stake,
      supplyApy: null,
      borrowApy: null,
    })
    expect(data.incentivesNetAPR).toBe(1)
    expect(data.underlyingSupplyApy).toBeNull()
    expect(data.underlyingBorrowApy).toBeNull()
    expect(data.supplyMMApy).toBeNull()
    expect(data.borrowMMApy).toBeNull()
    expect(data.totalSupplyApy).toBeNull()
    expect(data.totalBorrowApy).toBeNull()
  })

  it("gives a reserve with no borrow side a zero base borrow APY", () => {
    const data = toBorrowAssetApyData(input({ assetId: POOL, lpAPY: 0.4 }))

    expect(data.underlyingAssetsApyData).toEqual([
      { id: POOL, supplyApy: 0, borrowApy: 0 },
    ])
    expect(data.incentivesNetAPR).toBe(2)
    expect(data.underlyingBorrowApy).toBe(0)
    expect(data.borrowMMApy).toBe(2)
    expect(data.totalBorrowApy).toBeCloseTo(2.4)
    expect(data.totalSupplyApy).toBeCloseTo(2.4)
  })
})
