import { describe, expect, it } from "vitest"

import {
  readIceDepositUpdates,
  readIceMinAmountOut,
} from "@/modules/strategies/juicer/utils/iceDeposit"

const ev = (type: string, name: string, value: unknown) => ({
  type,
  value: { type: name, value },
})

describe("ICE deposit events", () => {
  const intentId = 7n

  it("reads the fill and learns the forward id from Queued (Lark 0 block shape)", () => {
    const events = [
      ev("LazyExecutor", "Queued", {
        id: 808n,
        src: { type: "ICE", value: 7n },
      }),
      ev("Intent", "IntentResolved", { id: 7n, amount_in: 5n, amount_out: 4n }),
      ev("ICE", "SolutionExecuted", {}),
    ]
    expect(readIceDepositUpdates(events, { intentId })).toEqual([
      {
        stage: "filled",
        intentId: 7n,
        amountIn: 5n,
        amountOut: 4n,
        forwardId: 808n,
      },
    ])
  })

  it("reads the forward's result by its queue id only", () => {
    const ok = [
      ev("LazyExecutor", "Executed", { id: 808n, result: { success: true } }),
    ]
    const failed = [
      ev("LazyExecutor", "Executed", { id: 808n, result: { success: false } }),
    ]
    const other = [
      ev("LazyExecutor", "Executed", { id: 809n, result: { success: true } }),
    ]
    expect(readIceDepositUpdates(ok, { intentId, forwardId: 808n })).toEqual([
      { stage: "deposited" },
    ])
    expect(
      readIceDepositUpdates(failed, { intentId, forwardId: 808n }),
    ).toEqual([{ stage: "forwardFailed", reason: "ForwardReverted" }])
    expect(readIceDepositUpdates(other, { intentId, forwardId: 808n })).toEqual(
      [],
    )
  })

  it("follows the intent re-included under a new id after a fork (Lark 0, block 66374)", () => {
    // the UI kept the id from a retracted best block; the canonical block
    // gave the same transaction another id
    const events = [
      ev("LazyExecutor", "Queued", {
        id: 848n,
        src: { type: "ICE", value: 9n },
        who: "owner",
      }),
      ev("Intent", "IntentResolved", { id: 9n, amount_in: 5n, amount_out: 4n }),
      ev("LazyExecutor", "Executed", { id: 848n, result: { success: true } }),
    ]
    const match = { isOwner: (who: string) => who === "owner", amountIn: 5n }
    expect(readIceDepositUpdates(events, { intentId, match })).toEqual([
      {
        stage: "filled",
        intentId: 9n,
        amountIn: 5n,
        amountOut: 4n,
        forwardId: 848n,
      },
      { stage: "deposited" },
    ])
    // another account's, or another amount's, fill is not this deposit's
    expect(
      readIceDepositUpdates(events, {
        intentId,
        match: { ...match, isOwner: () => false },
      }),
    ).toEqual([])
    expect(
      readIceDepositUpdates(events, {
        intentId,
        match: { ...match, amountIn: 6n },
      }),
    ).toEqual([])
  })

  it("ignores other intents", () => {
    const events = [
      ev("Intent", "IntentResolved", { id: 8n, amount_in: 1n, amount_out: 1n }),
    ]
    expect(readIceDepositUpdates(events, { intentId })).toEqual([])
  })

  it("takes the slippage off the quote", () => {
    expect(readIceMinAmountOut(10_000n, 1)).toBe(9_900n)
    expect(readIceMinAmountOut(10_000n, 0.5)).toBe(9_950n)
  })
})
