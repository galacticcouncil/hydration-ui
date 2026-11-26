import { describe, expect, it } from "vitest"

import { requestFundedShares } from "./requestFunded"

const unit = 10n ** 18n
const base = {
  units: 4n * unit,
  requestEpoch: 1n,
  requestScale: 0n,
  epoch: 1n,
  unitScale: 0n,
  totalUnits: 100n * unit,
  fund: 50n * unit,
}

describe("Funded shares of a waiting withdrawal", () => {
  it("takes the request's slice of the fund", () => {
    expect(requestFundedShares(base)).toBe(2n * unit)
  })

  it("is zero when the wallet covered the whole request", () => {
    expect(requestFundedShares({ ...base, units: 0n })).toBe(0n)
  })

  it("shifts units stored before a rescale like the contract does", () => {
    expect(
      requestFundedShares({
        ...base,
        units: 4n * unit * 2n ** 64n,
        unitScale: 64n,
      }),
    ).toBe(2n * unit)
  })

  it("drops units from an epoch that was written off", () => {
    expect(requestFundedShares({ ...base, epoch: 2n, unitScale: 0n })).toBe(0n)
  })

  it("is zero while no units exist", () => {
    expect(requestFundedShares({ ...base, totalUnits: 0n })).toBe(0n)
  })
})
