import type { XcJourney } from "@galacticcouncil/xc-scan"
import { describe, expect, it, vi } from "vitest"

import { filterPortfolioTransferHistory } from "./PortfolioTransferHistory.utils"

vi.mock("@/modules/xcm/history/utils/claim", () => ({
  resolveChainFromUrn: (urn: string) =>
    new Map([
      ["urn:ocn:ethereum:1", { name: "Ethereum" }],
      ["urn:ocn:polkadot:2034", { name: "Hydration" }],
    ]).get(urn),
}))
vi.mock("@galacticcouncil/ui/assets/icons", () => ({}))
vi.mock("@galacticcouncil/ui/components", () => ({}))

const incoming = {
  correlationId: "incoming",
  origin: "urn:ocn:ethereum:1",
  destination: "urn:ocn:polkadot:2034",
  from: "sender",
  to: "recipient",
  status: "completed",
  assets: [{ symbol: "USDC" }],
} as XcJourney
const outgoing = {
  ...incoming,
  correlationId: "outgoing",
  origin: incoming.destination,
  destination: incoming.origin,
}

describe("portfolio transfer history", () => {
  it("keeps the full shared history in its original order, including both directions", () => {
    const journeys = [outgoing, incoming]
    expect(filterPortfolioTransferHistory(journeys, "all", "")).toEqual(
      journeys,
    )
    expect(journeys).toEqual([outgoing, incoming])
  })

  it.each(["received", "success", "completed", "confirmed"] as const)(
    "includes %s in Completed",
    (status) => {
      const journey = { ...incoming, status }
      expect(
        filterPortfolioTransferHistory([journey], "completed", ""),
      ).toEqual([journey])
      expect(filterPortfolioTransferHistory([journey], "pending", "")).toEqual(
        [],
      )
    },
  )

  it("keeps waiting claims in progress and in Needs attention", () => {
    const waiting = { ...incoming, status: "waiting" as const }
    expect(filterPortfolioTransferHistory([waiting], "pending", "")).toEqual([
      waiting,
    ])
    expect(filterPortfolioTransferHistory([waiting], "attention", "")).toEqual([
      waiting,
    ])
  })

  it("puts pending transfers and failed transfers in the appropriate tabs", () => {
    const pending = { ...incoming, status: "pending" as const }
    const sent = { ...incoming, status: "sent" as const }
    const failures = (["fail", "failed", "timeout"] as const).map((status) => ({
      ...incoming,
      status,
    }))
    const journeys = [incoming, pending, sent, ...failures]
    expect(filterPortfolioTransferHistory(journeys, "pending", "")).toEqual([
      pending,
      sent,
    ])
    expect(filterPortfolioTransferHistory(journeys, "attention", "")).toEqual(
      failures,
    )
  })

  it("searches assets, chain names and accounts without changing the status filter", () => {
    expect(
      filterPortfolioTransferHistory([incoming, outgoing], "all", " USdc "),
    ).toEqual([incoming, outgoing])
    expect(
      filterPortfolioTransferHistory([incoming], "all", "Ethereum"),
    ).toEqual([incoming])
    expect(filterPortfolioTransferHistory([incoming], "all", "DOT")).toEqual([])
    expect(
      filterPortfolioTransferHistory([incoming], "all", "recipient"),
    ).toEqual([incoming])
    expect(
      filterPortfolioTransferHistory([incoming], "pending", "USDC"),
    ).toEqual([])
    expect(
      filterPortfolioTransferHistory([incoming], "all", "nonexistent"),
    ).toEqual([])
  })

  it("handles missing asset symbols and empty history", () => {
    expect(filterPortfolioTransferHistory([], "all", "")).toEqual([])
    expect(
      filterPortfolioTransferHistory(
        [{ ...incoming, assets: [] }],
        "all",
        "USDC",
      ),
    ).toEqual([])
  })
})
