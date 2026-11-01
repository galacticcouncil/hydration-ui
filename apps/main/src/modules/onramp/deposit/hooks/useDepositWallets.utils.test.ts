import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { describe, expect, it, vi } from "vitest"

import {
  isDetectedDepositWallet,
  startDepositWalletQueue,
} from "./useDepositWallets.utils"

const deferred = <T>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}
const wallet = (
  provider: WalletProviderType,
  title: string,
  installed = true,
) => ({ provider, title, installed, logo: "" })

describe("deposit source wallets", () => {
  it("includes installed source signers, not view-only, QR, or web-only NEAR connectors", () => {
    expect(
      isDetectedDepositWallet(wallet(WalletProviderType.Phantom, "Phantom")),
    ).toBe(true)
    expect(
      isDetectedDepositWallet(wallet(WalletProviderType.Suiet, "Suiet")),
    ).toBe(true)
    expect(
      isDetectedDepositWallet(
        wallet(WalletProviderType.ExternalWallet, "View as"),
      ),
    ).toBe(false)
    expect(
      isDetectedDepositWallet(
        wallet(WalletProviderType.WalletConnect, "WalletConnect"),
      ),
    ).toBe(false)
    expect(
      isDetectedDepositWallet(
        wallet(WalletProviderType.IntearWallet, "Intear"),
      ),
    ).toBe(false)
    expect(
      isDetectedDepositWallet({
        ...wallet(WalletProviderType.MeteorWallet, "Meteor"),
        hasExtension: true,
      }),
    ).toBe(true)
  })
})

describe("sequential deposit wallet approvals", () => {
  it("waits for one approval before requesting the next, and continues after rejection", async () => {
    const first = deferred<boolean>()
    const connect = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce(true)
    const onResult = vi.fn()
    const queue = startDepositWalletQueue(
      [WalletProviderType.Talisman, WalletProviderType.Phantom],
      { connect, abandon: vi.fn(), onResult },
    )
    expect(connect).toHaveBeenCalledTimes(1)
    first.resolve(false)
    await queue.done
    expect(connect.mock.calls).toEqual([
      [WalletProviderType.Talisman],
      [WalletProviderType.Phantom],
    ])
    expect(onResult.mock.calls).toEqual([
      [WalletProviderType.Talisman, "pending"],
      [WalletProviderType.Talisman, "rejected"],
      [WalletProviderType.Phantom, "pending"],
      [WalletProviderType.Phantom, "connected"],
    ])
  })

  it("can skip an unresolved popup without waiting or treating its late approval as connected", async () => {
    const first = deferred<boolean>()
    const connect = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce(true)
    const abandon = vi.fn()
    const onResult = vi.fn()
    const queue = startDepositWalletQueue(
      [WalletProviderType.Talisman, WalletProviderType.Phantom],
      { connect, abandon, onResult },
    )
    queue.skip()
    await queue.done
    first.resolve(true)
    await first.promise
    expect(abandon).toHaveBeenCalledWith(WalletProviderType.Talisman)
    expect(onResult.mock.calls).toEqual([
      [WalletProviderType.Talisman, "pending"],
      [WalletProviderType.Talisman, "skipped"],
      [WalletProviderType.Phantom, "pending"],
      [WalletProviderType.Phantom, "connected"],
    ])
  })

  it("stops opening more wallets when the deposit flow is closed", async () => {
    const connect = vi.fn(() => new Promise<boolean>(() => {}))
    const abandon = vi.fn()
    const queue = startDepositWalletQueue(
      [WalletProviderType.Talisman, WalletProviderType.Phantom],
      { connect, abandon, onResult: vi.fn() },
    )
    queue.cancel()
    await queue.done
    expect(connect).toHaveBeenCalledTimes(1)
    expect(abandon).toHaveBeenCalledWith(WalletProviderType.Talisman)
  })
})
