import type { AnyChain, Asset } from "@galacticcouncil/xc-core"
import { describe, expect, it } from "vitest"

import type { DepositBalanceRow } from "@/modules/onramp/deposit/DepositDiscovery.utils"

import { getOtherDepositAssets } from "./DepositConnectedAssets.utils"

const ethereum = { key: "ethereum" } as AnyChain
const base = { key: "base" } as AnyChain
const usdc = { key: "usdc" } as Asset
const eth = { key: "eth" } as Asset

const holding = (chain: AnyChain, asset: Asset, address = "alice") =>
  ({
    key: `${chain.key}:${address}:${asset.key}`,
    source: { chain, account: { address } },
    balance: { key: asset.key },
  }) as DepositBalanceRow

describe("other supported deposit assets", () => {
  it("returns the supported catalog in input order when no holdings exist", () => {
    const rows = getOtherDepositAssets(
      [
        { chain: ethereum, assets: [eth, usdc] },
        { chain: base, assets: [usdc] },
      ],
      [],
    )
    expect(rows.map(({ chain, asset }) => [chain.key, asset.key])).toEqual([
      ["ethereum", "eth"],
      ["ethereum", "usdc"],
      ["base", "usdc"],
    ])
    expect(rows[0]?.chain).toBe(ethereum)
    expect(rows[0]?.asset).toBe(eth)
  })

  it("deduplicates repeated routes and repeated assets while keeping the first instances", () => {
    const duplicate = { key: "usdc" } as Asset
    const rows = getOtherDepositAssets(
      [
        { chain: ethereum, assets: [usdc, eth, duplicate] },
        { chain: ethereum, assets: [duplicate] },
      ],
      [],
    )
    expect(rows).toHaveLength(2)
    expect(rows[0]?.asset).toBe(usdc)
    expect(rows[1]?.asset).toBe(eth)
  })

  it("excludes owned pairs even when several accounts hold them", () => {
    const rows = getOtherDepositAssets(
      [{ chain: ethereum, assets: [usdc, eth] }],
      [holding(ethereum, usdc), holding(ethereum, usdc, "bob")],
    )
    expect(rows.map(({ asset }) => asset.key)).toEqual(["eth"])
  })

  it("keeps the same asset on another chain when only one chain has funds", () => {
    const rows = getOtherDepositAssets(
      [
        { chain: ethereum, assets: [usdc] },
        { chain: base, assets: [usdc] },
      ],
      [holding(ethereum, usdc)],
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]?.chain).toBe(base)
    expect(rows[0]?.asset).toBe(usdc)
  })

  it("returns an empty list when no other supported assets remain", () => {
    expect(getOtherDepositAssets([], [holding(ethereum, usdc)])).toEqual([])
    expect(
      getOtherDepositAssets(
        [{ chain: ethereum, assets: [usdc] }],
        [holding(ethereum, usdc)],
      ),
    ).toEqual([])
  })

  it("does not mutate catalog arrays, holdings, chains, or assets", () => {
    const assets = Object.freeze([usdc, eth])
    const pairs = Object.freeze([{ chain: ethereum, assets: [...assets] }])
    const holdings = Object.freeze([holding(ethereum, usdc)])
    const before = pairs[0]?.assets.slice()

    getOtherDepositAssets(pairs, holdings)

    expect(pairs[0]?.assets).toEqual(before)
    expect(pairs[0]?.chain).toBe(ethereum)
    expect(pairs[0]?.assets[0]).toBe(usdc)
    expect(holdings[0]?.balance.key).toBe("usdc")
  })
})
