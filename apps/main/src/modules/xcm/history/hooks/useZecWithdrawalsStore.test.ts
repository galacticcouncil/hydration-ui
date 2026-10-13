import { describe, expect, it } from "vitest"

import {
  findZecWithdrawal,
  ZecWithdrawal,
} from "@/modules/xcm/history/hooks/useZecWithdrawalsStore"

const SENT_AT = Date.UTC(2026, 9, 13, 12)
const MINUTE = 60_000

const withdrawal = (
  txHash: string,
  submittedAt: number,
  fields: Partial<ZecWithdrawal> = {},
): ZecWithdrawal => ({
  txHash,
  nearAccount: "alice.near",
  amount: "50000000",
  recipient: `t1${txHash}`,
  submittedAt,
  ...fields,
})

// Claims 0.5 ZEC on alice.near, the journey sent at SENT_AT
const find = (withdrawals: ZecWithdrawal[]) =>
  findZecWithdrawal(withdrawals, "alice.near", "50000000", SENT_AT)

describe("findZecWithdrawal", () => {
  it("finds the withdrawal submitted just before the journey was sent", () => {
    const sent = withdrawal("0xa", SENT_AT - MINUTE)

    expect(find([sent])).toBe(sent)
  })

  it.each([
    ["another NEAR account", { nearAccount: "bob.near" }],
    ["another amount", { amount: "50000001" }],
  ])("skips a withdrawal to %s", (_, fields) => {
    expect(find([withdrawal("0xa", SENT_AT - MINUTE, fields)])).toBeUndefined()
  })

  it("skips a withdrawal submitted over an hour away from the journey", () => {
    expect(find([withdrawal("0xa", SENT_AT - 61 * MINUTE)])).toBeUndefined()
  })

  it("takes the withdrawal submitted closest to the journey of two alike", () => {
    const earlier = withdrawal("0xa", SENT_AT - 30 * MINUTE)
    const closest = withdrawal("0xb", SENT_AT - MINUTE)

    expect(find([earlier, closest])).toBe(closest)
  })
})
