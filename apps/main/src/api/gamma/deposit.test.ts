import { maxUint256 } from "viem"
import { describe, expect, it } from "vitest"

import { checkPairedAmount } from "@/api/gamma/deposit"

// ±0.1% band around 1000, as the mainnet clearing returns it
const band = { start: 999n, end: 1001n }

describe("checkPairedAmount", () => {
  it("signs the shown amount while the vault accepts it", () => {
    expect(checkPairedAmount(1000n, band)).toEqual({ ok: true, amount: 1000n })
    expect(checkPairedAmount(999n, band)).toEqual({ ok: true, amount: 999n })
    expect(checkPairedAmount(1001n, band)).toEqual({ ok: true, amount: 1001n })
  })

  it("never signs a moved amount, however small the move", () => {
    expect(checkPairedAmount(998n, band)).toEqual({ ok: false, amount: 1000n })
    expect(checkPairedAmount(1002n, band)).toEqual({
      ok: false,
      amount: 1000n,
    })
  })

  it("returns the fresh amount when the ratio moved far", () => {
    // the PoC: 88.48 shown, vault wanted ~3x
    const tripled = { start: 2997n, end: 3003n }
    expect(checkPairedAmount(1000n, tripled)).toEqual({
      ok: false,
      amount: 3000n,
    })
  })

  it("accepts any amount into an empty vault", () => {
    const empty = { start: 0n, end: maxUint256 }
    expect(checkPairedAmount(5n, empty)).toEqual({ ok: true, amount: 5n })
  })
})
