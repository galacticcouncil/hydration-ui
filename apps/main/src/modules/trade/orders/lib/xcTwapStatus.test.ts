import { describe, expect, it } from "vitest"

import { getXcTwapStatus } from "@/modules/trade/orders/lib/xcTwapStatus"

describe("getXcTwapStatus", () => {
  it.each([
    ["notIndexed", true, null, "waitingFirstOrder"],
    ["notIndexed", false, null, "unavailable"],
    ["pending", true, "0", "active"],
    ["pending", true, "500", "active"],
    ["pending", false, "500", "payingOut"],
    ["pending", false, "0", "unavailable"],
    ["pending", false, null, "unavailable"],
    ["closing", true, "500", "cancelling"],
    ["closing", false, null, "cancelling"],
    ["completed", false, "0", "completed"],
    ["refunded", false, "0", "refunded"],
    ["expired", true, "0", "expired"],
    ["failed", true, null, "unavailable"],
    ["failed", false, "500", "unavailable"],
  ] as const)(
    "%s, live %s, held %s → %s",
    (scanStatus, intentLive, held, expected) => {
      expect(getXcTwapStatus({ scanStatus, intentLive, held })).toBe(expected)
    },
  )
})
