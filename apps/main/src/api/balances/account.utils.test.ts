import { Subject } from "rxjs"
import { describe, expect, it } from "vitest"

import {
  catchUpToBest,
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

describe("catchUpToBest", () => {
  it("follows the watch's first value with a best-block read, then the watch", async () => {
    const watch$ = new Subject<string>()
    let resolveBest: (value: string) => void = () => {}
    const seen: string[] = []
    catchUpToBest(
      watch$,
      () => new Promise<string>((resolve) => (resolveBest = resolve)),
    ).subscribe((value) => seen.push(value))

    watch$.next("finalized")
    // a newer watch value waits for the read, so it lands last
    watch$.next("newer")
    expect(seen).toEqual(["finalized"])
    resolveBest("best")
    await Promise.resolve()
    await Promise.resolve()
    expect(seen).toEqual(["finalized", "best", "newer"])
  })

  it("keeps watching when the best-block read fails", async () => {
    const watch$ = new Subject<string>()
    const seen: string[] = []
    catchUpToBest(watch$, () => Promise.reject(new Error("rpc"))).subscribe(
      (value) => seen.push(value),
    )
    watch$.next("finalized")
    await Promise.resolve()
    watch$.next("next")
    await Promise.resolve()
    expect(seen).toEqual(["finalized", "next"])
  })
})
