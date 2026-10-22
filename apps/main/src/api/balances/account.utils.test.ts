import { describe, expect, it } from "vitest"

import {
  createErc20BalanceSnapshot,
  syncErc20BalanceSnapshot,
} from "@/api/balances/account.utils"
import { Balance, BalanceRecord } from "@/api/balances/types"

const ATOKEN = "1001"
const ERC20 = "222"

const balances = (entries: Record<string, bigint>): BalanceRecord =>
  Object.fromEntries(
    Object.entries(entries).map(([assetId, amount]) => [
      assetId,
      { assetId, total: amount, transferable: amount } as Balance,
    ]),
  )

const isAToken = (assetId: string) => assetId === ATOKEN

describe("syncErc20BalanceSnapshot", () => {
  it("does not sync on the first load, even with aTokens held", () => {
    const snapshot = createErc20BalanceSnapshot()

    expect(
      syncErc20BalanceSnapshot(snapshot, balances({ [ATOKEN]: 10n }), isAToken),
    ).toBe(false)
  })

  it("syncs when an aToken is first held after the initial load", () => {
    const snapshot = createErc20BalanceSnapshot()
    syncErc20BalanceSnapshot(snapshot, balances({}), isAToken)

    expect(
      syncErc20BalanceSnapshot(snapshot, balances({ [ATOKEN]: 10n }), isAToken),
    ).toBe(true)
  })

  it("syncs when a held aToken changes by 1%", () => {
    const snapshot = createErc20BalanceSnapshot()
    syncErc20BalanceSnapshot(
      snapshot,
      balances({ [ATOKEN]: 100_000n }),
      isAToken,
    )

    expect(
      syncErc20BalanceSnapshot(
        snapshot,
        balances({ [ATOKEN]: 101_000n }),
        isAToken,
      ),
    ).toBe(true)
  })

  it("ignores a held aToken changing by less than 0.01%", () => {
    const snapshot = createErc20BalanceSnapshot()
    syncErc20BalanceSnapshot(
      snapshot,
      balances({ [ATOKEN]: 100_000n }),
      isAToken,
    )

    expect(
      syncErc20BalanceSnapshot(
        snapshot,
        balances({ [ATOKEN]: 100_001n }),
        isAToken,
      ),
    ).toBe(false)
  })

  it("ignores balances that are not aTokens", () => {
    const snapshot = createErc20BalanceSnapshot()
    syncErc20BalanceSnapshot(
      snapshot,
      balances({ [ERC20]: 100_000n }),
      isAToken,
    )

    expect(
      syncErc20BalanceSnapshot(
        snapshot,
        balances({ [ERC20]: 200_000n }),
        isAToken,
      ),
    ).toBe(false)
  })
})
