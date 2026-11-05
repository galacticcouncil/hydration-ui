import { describe, expect, it } from "vitest"

import { createDepositRequestLimiter } from "@/api/deposit.utils"

describe("deposit RPC scheduling", () => {
  it("bounds active snapshots and releases slots after an error", async () => {
    const run = createDepositRequestLimiter(2)
    let active = 0
    let peak = 0
    const completed: number[] = []
    const results = await Promise.allSettled(
      Array.from({ length: 7 }, (_, i) =>
        run(async () => {
          peak = Math.max(peak, ++active)
          await new Promise((resolve) => setTimeout(resolve, 2))
          active--
          if (i === 1) throw new Error("RPC unavailable")
          completed.push(i)
          return i
        }),
      ),
    )
    expect(peak).toBe(2)
    expect(completed).toHaveLength(6)
    expect(
      results.filter((result) => result.status === "rejected"),
    ).toHaveLength(1)
    expect(active).toBe(0)
  })
  it("rejects invalid concurrency", () => {
    expect(() => createDepositRequestLimiter(0)).toThrow()
    expect(() => createDepositRequestLimiter(1.5)).toThrow()
  })
})
