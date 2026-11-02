import { describe, expect, it } from "vitest"

import { keepFreshRpcs, MAX_HEAD_LAG_MS } from "./ping.utils"

const HEAD = 1_700_000_000_000

const node = (url: string, lagMs: number) => ({
  url,
  timestamp: HEAD - lagMs,
})

describe("keepFreshRpcs", () => {
  it("orders nodes newest head first", () => {
    const result = keepFreshRpcs([node("b", 6_000), node("a", 0)])

    expect(result.map((rpc) => rpc.url)).toEqual(["a", "b"])
  })

  it("keeps a node exactly at the lag limit and drops one past it", () => {
    const result = keepFreshRpcs([
      node("fresh", 0),
      node("limit", MAX_HEAD_LAG_MS),
      node("stale", MAX_HEAD_LAG_MS + 1),
    ])

    expect(result.map((rpc) => rpc.url)).toEqual(["fresh", "limit"])
  })

  it("keeps nodes with the same head in the order they answered", () => {
    const result = keepFreshRpcs([node("fast", 0), node("slow", 0)])

    expect(result.map((rpc) => rpc.url)).toEqual(["fast", "slow"])
  })

  it("measures lag against the newest node, not the clock", () => {
    const hourBehind = 3_600_000
    const result = keepFreshRpcs([
      node("a", hourBehind),
      node("b", hourBehind + 6_000),
    ])

    expect(result.map((rpc) => rpc.url)).toEqual(["a", "b"])
  })

  it("leaves the input untouched", () => {
    const input = [node("b", 6_000), node("a", 0)]
    keepFreshRpcs(input)

    expect(input.map((rpc) => rpc.url)).toEqual(["b", "a"])
  })
})
