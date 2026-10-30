import { describe, expect, it } from "vitest"

import { headroomExitFits, type HeadroomState } from "./headroomExit"

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

describe("headroomExitFits", () => {
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
