import { describe, expect, it } from "vitest"

import {
  type HeadroomState,
  type PendingExit,
  projectHeadroomExits,
} from "./headroomExit"

const settles = (s: HeadroomState, exits: PendingExit[]) =>
  projectHeadroomExits(s, exits).map((e) => e.viaHeadroom)

// a single exit starting now settles from headroom
const headroomExitFits = (s: HeadroomState, collateral: bigint) =>
  settles(s, [{ collateral, startsIn: 0 }])[0]

const unit = 10n ** 18n
const base = 10n ** 8n

// 10 collateral at $1,000 supplied, $5,000 of Main debt (LTV 50%) under a
// 73% cap less a 5% gap; the loop holds $6,000 of equity for that debt
const STATE: HeadroomState = {
  gapBps: 500,
  reserveConfig: 7300n,
  supplied: 10n * unit,
  idle: 0n,
  roundingReserve: 0n,
  totalAssets: 10n * unit,
  queuedCollateral: 0n,
  supply: 10n * unit,
  collateralBase: 10_000n * base,
  debtBase: 5_000n * base,
  syntheticSupplied: 0n,
  loopShares: 600n * unit,
  reservedShares: 0n,
  sourceEquity: 6_000n * base,
  sourceShares: 600n * unit,
  activeDebt: 5_000n * unit,
  activeCash: 0n,
  queuedDebt: 0n,
  protocolReserve: 1_000n * unit,
}

describe("a single exit", () => {
  it("settles an exit the LTV headroom absorbs", () => {
    // after 2 leave: 50% LTV on 8 of 10 collateral is 62.5%, under 68%
    expect(headroomExitFits(STATE, 2n * unit)).toBe(true)
  })

  it("queues an exit that would push the LTV past the cap less the gap", () => {
    // after 3 leave: 50 / 70 = 71.4%
    expect(headroomExitFits(STATE, 3n * unit)).toBe(false)
    expect(headroomExitFits({ ...STATE, gapBps: 7300 }, unit)).toBe(false)
  })

  it("queues when the slice's cash already covers its debt", () => {
    expect(
      headroomExitFits({ ...STATE, activeCash: 5_000n * unit }, unit),
    ).toBe(false)
    expect(headroomExitFits({ ...STATE, activeDebt: 0n }, unit)).toBe(false)
  })

  it("lets the reserve take a shortfall it can cover", () => {
    // the slice is worth $300 against $500 of debt: a $200 shortfall
    const underwater = { ...STATE, sourceEquity: 3_000n * base }
    expect(headroomExitFits(underwater, unit)).toBe(true)
    expect(
      headroomExitFits({ ...underwater, protocolReserve: 100n * unit }, unit),
    ).toBe(false)
    expect(
      headroomExitFits({ ...underwater, queuedDebt: 900n * unit }, unit),
    ).toBe(false)
  })

  it("counts queued collateral the vault does not hold as leaving too", () => {
    const queued = {
      ...STATE,
      totalAssets: 12n * unit,
      queuedCollateral: 2n * unit,
    }
    expect(headroomExitFits(queued, 2n * unit)).toBe(false)
    expect(headroomExitFits({ ...queued, idle: 2n * unit }, 2n * unit)).toBe(
      true,
    )
  })

  it("queues without loop shares or anything to exit", () => {
    expect(headroomExitFits({ ...STATE, loopShares: 0n }, unit)).toBe(false)
    expect(headroomExitFits(STATE, 0n)).toBe(false)
  })
})

describe("projectHeadroomExits", () => {
  const now = (collateral: bigint) => ({ collateral, startsIn: 0 })

  it("judges each waiting exit on the room the ones ahead left", () => {
    // 2 fit alone; after them, 2 more would leave 6 of 10 at 83% LTV
    expect(settles(STATE, [now(2n * unit), now(2n * unit)])).toEqual([
      true,
      false,
    ])
  })

  it("counts an unwinding exit ahead as leaving while its debt is unpaid", () => {
    // 3 queue for the unwind; their collateral leaves but Aave still holds
    // $5,000 of debt, so 1 more would leave 6 of 10 at 83%
    expect(settles(STATE, [now(3n * unit), now(unit)])).toEqual([false, false])
  })

  it("deploys the keeper's waiting credit before a later start", () => {
    // 500 HOLLAR a slice per minute toward the 68% band target
    const deploying: HeadroomState = {
      ...STATE,
      deployment: {
        credit: 10n * unit,
        bandGapBps: 500,
        sliceHollar: 500n * unit,
        sliceSeconds: 60,
      },
    }
    // started at once, 2 fit as before: 50 / 80 = 62.5%
    expect(settles(deploying, [now(2n * unit)])).toEqual([true])
    // a slice later, $5,500 of debt on 8 of 10 collateral is 68.75%
    expect(
      settles(deploying, [{ collateral: 2n * unit, startsIn: 30 }]),
    ).toEqual([false])
  })

  it("stops deploying at the band target", () => {
    const deploying: HeadroomState = {
      ...STATE,
      deployment: {
        credit: 10n * unit,
        bandGapBps: 3300,
        sliceHollar: 500n * unit,
        sliceSeconds: 60,
      },
    }
    // a 40% target sits under today's 50%: nothing deploys, 2 still fit
    expect(
      settles(deploying, [{ collateral: 2n * unit, startsIn: 600 }]),
    ).toEqual([true])
  })
})

describe("projected unwind", () => {
  it("is the slice's equity up to the debt it owes; headroom frees none", () => {
    // 3 of the 8 shares left after the headroom exit owe $1,875 and hold
    // $2,170 of loop equity: the unwind frees what repays the debt
    expect(
      projectHeadroomExits(STATE, [
        { collateral: 2n * unit, startsIn: 0 },
        { collateral: 3n * unit, startsIn: 0 },
      ]).map((e) => e.unwind),
    ).toEqual([0n, 1_875n * unit])
  })

  it("frees only the equity when it covers less than the debt", () => {
    // $300 of equity against $500 owed: cash and the reserve settle the rest
    const underwater = {
      ...STATE,
      sourceEquity: 3_000n * base,
      headroomOn: false,
    }
    expect(
      projectHeadroomExits(underwater, [{ collateral: unit, startsIn: 0 }])[0]!
        .unwind,
    ).toBe(300n * unit)
  })

  it("counts the debt the keeper borrows before the start", () => {
    const deploying: HeadroomState = {
      ...STATE,
      deployment: {
        credit: 10n * unit,
        bandGapBps: 500,
        sliceHollar: 500n * unit,
        sliceSeconds: 60,
      },
    }
    // two slices by the start: 3 of 10 shares of $6,000
    expect(
      projectHeadroomExits(deploying, [
        { collateral: 3n * unit, startsIn: 90 },
      ])[0]!.unwind,
    ).toBe(1_800n * unit)
  })
})
