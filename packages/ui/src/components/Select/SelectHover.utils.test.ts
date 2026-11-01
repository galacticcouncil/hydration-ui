import { describe, expect, it } from "vitest"

import { getSelectHoverTarget } from "./SelectHover.utils"

const items = [
  { key: "alice", label: "Alice · SubWallet" },
  { key: "bob", label: "Bob · Talisman" },
  { key: "alex", label: "Alex · SubWallet" },
]

describe("hover select keyboard navigation", () => {
  it.each([
    ["alice", "ArrowDown", "bob"],
    ["alex", "ArrowDown", "alice"],
    ["alice", "ArrowUp", "alex"],
    ["bob", "Home", "alice"],
    ["bob", "End", "alex"],
    [undefined, "ArrowDown", "alice"],
    [undefined, "ArrowUp", "alex"],
  ])("moves from %s with %s to %s", (active, key, expected) => {
    expect(getSelectHoverTarget(items, active, key!)).toBe(expected)
  })

  it("cycles matching accounts when the same letter is repeated", () => {
    expect(getSelectHoverTarget(items, "alice", "a", "a")).toBe("alex")
    expect(getSelectHoverTarget(items, "alex", "a", "aa")).toBe("alice")
  })

  it("keeps a matching account focused while completing its name", () => {
    expect(getSelectHoverTarget(items, "alice", "l", "al")).toBe("alice")
    expect(getSelectHoverTarget(items, "alice", "e", "ale")).toBe("alex")
  })

  it("leaves unsupported keys and missing matches to the browser", () => {
    expect(getSelectHoverTarget(items, "alice", "Tab")).toBeUndefined()
    expect(getSelectHoverTarget(items, "alice", "z", "z")).toBeUndefined()
    expect(getSelectHoverTarget([], undefined, "ArrowDown")).toBeUndefined()
  })
})
