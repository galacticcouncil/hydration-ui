import {
  createTable,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table"
import { describe, expect, it } from "vitest"

import type { PortfolioDepositSample } from "./PortfolioDepositPreview.mock"
import {
  filterPortfolioDepositSamples,
  getClaimablePortfolioDepositSamples,
  getPortfolioDepositSamples,
  PORTFOLIO_DEPOSIT_CLAIM_PRIORITY,
  prioritizeClaimableDepositSorting,
} from "./PortfolioDepositPreview.utils"

const sample = (
  status: PortfolioDepositSample["status"],
): PortfolioDepositSample => ({
  id: status,
  assetId: "22",
  symbol: "USDC",
  amount: "1250",
  source: "Ethereum",
  network: "Ethereum",
  method: "onchain",
  status,
  createdAt: 1,
})
const samples = [
  sample("awaiting"),
  sample("processing"),
  sample("confirming"),
  sample("claimable"),
  sample("completed"),
  sample("attention"),
  sample("failed"),
]

describe("portfolio deposit preview activity", () => {
  it("keeps ready-to-claim deposits pending until the preview claim completes", () => {
    expect(
      filterPortfolioDepositSamples(samples, "pending").map(
        ({ status }) => status,
      ),
    ).toEqual(["awaiting", "processing", "confirming", "claimable"])
    const claimed = getPortfolioDepositSamples(samples, ["claimable"])
    expect(
      filterPortfolioDepositSamples(claimed, "attention").map(
        ({ status }) => status,
      ),
    ).toEqual(["attention", "failed"])
    expect(
      filterPortfolioDepositSamples(claimed, "pending").map(
        ({ status }) => status,
      ),
    ).toEqual(["awaiting", "processing", "confirming"])
    expect(
      filterPortfolioDepositSamples(claimed, "completed").map(({ id }) => id),
    ).toEqual(["claimable", "completed"])
  })

  it("derives completed samples without changing the original fixtures", () => {
    const claimed = getPortfolioDepositSamples(samples, ["claimable", "failed"])
    expect(claimed.find(({ id }) => id === "claimable")?.status).toBe(
      "completed",
    )
    expect(claimed.find(({ id }) => id === "failed")?.status).toBe("failed")
    expect(samples.find(({ id }) => id === "claimable")?.status).toBe(
      "claimable",
    )
  })

  it("provides the current claimable samples for consumers outside the table", () => {
    expect(
      getClaimablePortfolioDepositSamples(samples).map(({ id }) => id),
    ).toEqual(["claimable"])
    expect(
      getClaimablePortfolioDepositSamples(
        getPortfolioDepositSamples(samples, ["claimable"]),
      ),
    ).toEqual([])
  })

  it("includes ready claims in attention while keeping completed deposits separate", () => {
    expect(
      filterPortfolioDepositSamples(samples, "attention").map(
        ({ status }) => status,
      ),
    ).toEqual(["claimable", "attention", "failed"])
    expect(
      filterPortfolioDepositSamples(samples, "completed").map(
        ({ status }) => status,
      ),
    ).toEqual(["completed"])
    expect(filterPortfolioDepositSamples(samples, "all")).toEqual(samples)
  })
})

const sortedDeposits = (
  deposits: PortfolioDepositSample[],
  sorting: SortingState,
) =>
  createTable({
    data: deposits,
    columns: [
      {
        id: PORTFOLIO_DEPOSIT_CLAIM_PRIORITY,
        accessorFn: (deposit) => Number(deposit.status === "claimable"),
        sortingFn: "basic",
      },
      { id: "date", accessorKey: "createdAt" },
      { id: "asset", accessorKey: "symbol" },
    ],
    state: { sorting: prioritizeClaimableDepositSorting(sorting) },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onStateChange: () => undefined,
    renderFallbackValue: null,
  })
    .getRowModel()
    .rows.map(({ original }) => original.id)

describe("claimable deposit priority", () => {
  const deposits = [
    { ...sample("awaiting"), symbol: "AAA", createdAt: 3 },
    { ...sample("claimable"), symbol: "ZZZ", createdAt: 1 },
    { ...sample("confirming"), symbol: "BBB", createdAt: 2 },
  ]

  it.each(["date", "asset"])(
    "keeps a claim first for ascending and descending %s sorts",
    (id) => {
      expect(sortedDeposits(deposits, [{ id, desc: true }])).toEqual([
        "claimable",
        ...(id === "date"
          ? ["awaiting", "confirming"]
          : ["confirming", "awaiting"]),
      ])
      expect(sortedDeposits(deposits, [{ id, desc: false }])).toEqual([
        "claimable",
        ...(id === "date"
          ? ["confirming", "awaiting"]
          : ["awaiting", "confirming"]),
      ])
    },
  )

  it("keeps claims first when sorting is removed or its priority is reversed", () => {
    expect(sortedDeposits(deposits, [])[0]).toBe("claimable")
    expect(
      sortedDeposits(deposits, [
        { id: PORTFOLIO_DEPOSIT_CLAIM_PRIORITY, desc: false },
      ])[0],
    ).toBe("claimable")
  })

  it("returns a completed claim to the chosen activity order", () => {
    const claimed = getPortfolioDepositSamples(deposits, ["claimable"])
    expect(sortedDeposits(claimed, [{ id: "date", desc: true }])).toEqual([
      "awaiting",
      "confirming",
      "claimable",
    ])
    expect(deposits[1]?.status).toBe("claimable")
  })
})
