import { maxUint256 } from "viem"
import { describe, expect, it } from "vitest"

import { checkPairedAmount } from "@/api/gamma/deposit"

// ±0.1% band around 1000, as the mainnet clearing returns it
const band = { start: 999n, end: 1001n }

describe("checkPairedAmount", () => {
  it("signs the shown amount while the vault accepts it", () => {
    expect(checkPairedAmount(1000n, band, 3)).toEqual({
      ok: true,
      amount: 1000n,
    })
    expect(checkPairedAmount(999n, band, 0)).toEqual({ ok: true, amount: 999n })
  })

  it("signs the band mid when the move is within tolerance", () => {
    expect(checkPairedAmount(980n, band, 3)).toEqual({
      ok: true,
      amount: 1000n,
    })
    expect(checkPairedAmount(1030n, band, 3)).toEqual({
      ok: true,
      amount: 1000n,
    })
  })

  it("blocks a move past tolerance, in either direction", () => {
    // ratio tripled under the user: 1000 shown, vault now wants 3000
    const tripled = { start: 2997n, end: 3003n }
    expect(checkPairedAmount(1000n, tripled, 3)).toEqual({
      ok: false,
      amount: 3000n,
    })
    expect(checkPairedAmount(1100n, band, 3)).toEqual({
      ok: false,
      amount: 1000n,
    })
  })

  it("treats exactly the tolerance as within it", () => {
    expect(checkPairedAmount(1000n, { start: 1030n, end: 1030n }, 3).ok).toBe(
      true,
    )
    expect(checkPairedAmount(1000n, { start: 1031n, end: 1031n }, 3).ok).toBe(
      false,
    )
  })

  it("accepts any amount into an empty vault", () => {
    const empty = { start: 0n, end: maxUint256 }
    expect(checkPairedAmount(5n, empty, 0)).toEqual({ ok: true, amount: 5n })
  })

  it("never passes a zero shown amount on tolerance", () => {
    expect(checkPairedAmount(0n, band, 100).ok).toBe(false)
  })
})
