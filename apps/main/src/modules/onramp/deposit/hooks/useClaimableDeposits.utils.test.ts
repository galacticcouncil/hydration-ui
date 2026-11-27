import {
  safeConvertAddressSS58,
  safeConvertH160toSS58,
  safeConvertSS58toPublicKey,
} from "@galacticcouncil/utils"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { describe, expect, it } from "vitest"

import { filterClaimableDeposits } from "./useClaimableDeposits.utils"

const alice = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
const evm = "0x0000000000000000000000000000000000000001"
const hydration = "urn:ocn:polkadot:2034"
const ethereum = "urn:ocn:ethereum:1"
const deposit = {
  correlationId: "claim-1",
  origin: ethereum,
  destination: hydration,
  from: evm,
  to: alice,
  status: "waiting",
} as XcJourney

const filter = (journeys: XcJourney[], addresses: string[] = [alice]) =>
  filterClaimableDeposits(journeys, addresses)

describe("claimable Hydration deposits", () => {
  it("keeps inbound journeys for the active recipient", () => {
    expect(filter([deposit])).toEqual([deposit])
  })

  it("does not count the active account's withdrawals or transfers to another recipient", () => {
    expect(
      filter([
        {
          ...deposit,
          origin: hydration,
          destination: ethereum,
          from: alice,
          to: evm,
        },
        { ...deposit, from: alice, to: evm },
      ]),
    ).toEqual([])
  })

  it("requires the exact Hydration destination and an external origin", () => {
    expect(
      filter([
        { ...deposit, destination: "urn:ocn:kusama:2034" },
        { ...deposit, destination: ethereum },
        { ...deposit, origin: hydration },
        { ...deposit, origin: "" },
      ]),
    ).toEqual([])
  })

  it("matches a raw public key and SS58 addresses across prefixes", () => {
    const prefixed = { ...deposit, to: safeConvertAddressSS58(alice, 0) }
    const publicKey = { ...deposit, to: safeConvertSS58toPublicKey(alice) }
    expect(filter([prefixed])).toEqual([prefixed])
    expect(filter([publicKey])).toEqual([publicKey])
  })

  it("matches H160 and its Hydration mapped recipient in either direction", () => {
    const mapped = safeConvertH160toSS58(evm)
    const mappedDeposit = { ...deposit, to: mapped }
    const evmDeposit = { ...deposit, to: evm }
    expect(filter([mappedDeposit], [evm])).toEqual([mappedDeposit])
    expect(filter([evmDeposit], [mapped])).toEqual([evmDeposit])
  })

  it("falls back to the formatted recipient when the raw value is unresolvable", () => {
    const formatted = { ...deposit, to: "", toFormatted: alice }
    expect(filter([formatted])).toEqual([formatted])
  })

  it("does not let a conflicting formatted recipient override a valid raw recipient", () => {
    expect(filter([{ ...deposit, to: evm, toFormatted: alice }])).toEqual([])
  })

  it("accepts either representation of the active account", () => {
    expect(filter([deposit], ["invalid", alice])).toEqual([deposit])
  })

  it("does not match missing or invalid account and recipient addresses", () => {
    expect(filter([deposit], [])).toEqual([])
    expect(filter([deposit], ["", "invalid"])).toEqual([])
    expect(
      filter([{ ...deposit, to: "invalid", toFormatted: "invalid" }]),
    ).toEqual([])
  })

  it("deduplicates by claim identity while preserving native order and separate claims", () => {
    const otherClaim = { ...deposit, correlationId: "claim-2" }
    expect(filter([deposit, deposit, otherClaim])).toEqual([
      deposit,
      otherClaim,
    ])
    expect(filter([{ ...deposit, correlationId: "" }])).toEqual([])
  })

  it("does not let another recipient's duplicate hide the matching claim", () => {
    expect(filter([{ ...deposit, to: evm }, deposit])).toEqual([deposit])
  })
})
