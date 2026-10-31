import {
  safeConvertAddressSS58,
  safeConvertH160toSS58,
} from "@galacticcouncil/utils"
import { describe, expect, it } from "vitest"

import { isDepositAccountAddress } from "./PortfolioDepositActivity.utils"

const alice = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
const evm = "0x0000000000000000000000000000000000000001"

describe("portfolio deposit account scope", () => {
  it("matches the same account across SS58 prefixes", () => {
    expect(
      isDepositAccountAddress(safeConvertAddressSS58(alice, 0), alice),
    ).toBe(true)
  })

  it("matches an EVM account with its Hydration destination", () => {
    expect(isDepositAccountAddress(safeConvertH160toSS58(evm), evm)).toBe(true)
  })

  it("does not show another account's transfer", () => {
    expect(isDepositAccountAddress(alice, evm)).toBe(false)
  })

  it("does not treat invalid or missing addresses as a match", () => {
    expect(isDepositAccountAddress("", "")).toBe(false)
    expect(isDepositAccountAddress("invalid", "invalid")).toBe(false)
    expect(isDepositAccountAddress(alice)).toBe(false)
  })
})
