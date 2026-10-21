import { describe, expect, it } from "vitest"

import { pushRecentExternalWallet } from "@/utils/recentExternalWallets"

const evm = (n: number) => `0x${n.toString(16).padStart(40, "0")}`

describe("pushRecentExternalWallet", () => {
  it("moves a re-watched address to the top without duplicating it", () => {
    const recent = [evm(1), evm(2), evm(3)]
    expect(pushRecentExternalWallet(recent, evm(3))).toEqual([
      evm(3),
      evm(1),
      evm(2),
    ])
  })

  it("matches EVM addresses case-insensitively", () => {
    const address = "0x19912230039c10861946dF36CDe0eFeF09C3894A"
    expect(pushRecentExternalWallet([address.toLowerCase()], address)).toEqual([
      address,
    ])
  })

  it("never keeps more than 5 addresses", () => {
    const recent = [1, 2, 3, 4, 5].map(evm)
    expect(pushRecentExternalWallet(recent, evm(6))).toEqual(
      [6, 1, 2, 3, 4].map(evm),
    )
  })
})
