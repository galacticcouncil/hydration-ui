import type { XcJourney } from "@galacticcouncil/xc-scan"
import { describe, expect, it, vi } from "vitest"

import { findDepositJourney } from "@/modules/onramp/deposit/DepositTracking.utils"
import type { SubmittedDeposit } from "@/modules/onramp/deposit/store/useDepositJourneyStore"

vi.mock("@/modules/xcm/history/useXcScan", () => ({
  createXcScanQueryKey: (address: string) => ["xcscan", address],
}))
vi.mock("@galacticcouncil/ui/assets/icons", () => ({}))
vi.mock("@galacticcouncil/ui/components", () => ({}))
vi.mock("@galacticcouncil/money-market/ui-config", () => ({
  AaveV3HydrationMainnet: {
    GHO_TOKEN_ADDRESS: "0x0000000000000000000000000000000000000000",
  },
}))
const placeholder = {
  correlationId: "optimistic:0xabc",
  originTxPrimary: "0xabc",
  destination: "urn:ocn:polkadot:2034",
  origin: "urn:ocn:polkadot:1000",
  from: "alice",
  to: "bob",
  sentAt: 1000000,
  assets: [{ symbol: "DOT", amount: "100", decimals: 10 }],
} as XcJourney
const submitted = {
  txHash: "0xabc",
  optimistic: placeholder,
} as SubmittedDeposit
const real = {
  ...placeholder,
  correlationId: "indexed",
  status: "received",
} as XcJourney

describe("deposit arrival correlation", () => {
  it("never confirms an optimistic placeholder", () =>
    expect(findDepositJourney(submitted, [placeholder])).toBeUndefined())
  it("requires arrival on Hydration, not an intermediate hop", () =>
    expect(
      findDepositJourney(submitted, [
        { ...real, destination: "urn:ocn:kusama:1000" },
      ]),
    ).toBeUndefined())
  it("matches the exact transaction and deduplicates source/destination responses", () =>
    expect(findDepositJourney(submitted, [real, real])).toEqual(real))
  it("correlates a canonical record only when its route, parties, amount and time fit", () => {
    const canonical = { ...real, originTxPrimary: undefined }
    expect(findDepositJourney(submitted, [canonical])).toEqual(canonical)
    expect(
      findDepositJourney(submitted, [{ ...canonical, to: "other" }]),
    ).toBeUndefined()
    expect(
      findDepositJourney(submitted, [{ ...canonical, sentAt: 2000000 }]),
    ).toBeUndefined()
  })
  it("keeps case-sensitive chain transaction ids distinct", () => {
    expect(
      findDepositJourney(
        { ...submitted, txHash: "AbCd", optimistic: undefined },
        [{ ...real, originTxPrimary: "abcd" }],
      ),
    ).toBeUndefined()
  })
  it("keeps ambiguous canonical transfers pending", () => {
    expect(
      findDepositJourney(submitted, [
        { ...real, originTxPrimary: undefined },
        { ...real, correlationId: "another", originTxPrimary: undefined },
      ]),
    ).toBeUndefined()
  })
})
