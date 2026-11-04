import { describe, expect, it, vi } from "vitest"

import { WalletProviderType } from "@/config/providers"
import { connectWalletsSequentially } from "@/utils/connectWallets"

const providers = [WalletProviderType.PolkadotJS, WalletProviderType.MetaMask]

describe("Connect all wallet authorization", () => {
  it("waits for Polkadot.js authorization before requesting the next wallet", async () => {
    let approve!: () => void
    const authorization = new Promise<void>((resolve) => {
      approve = resolve
    })
    const connect = vi.fn((provider: WalletProviderType) =>
      provider === WalletProviderType.PolkadotJS
        ? authorization
        : Promise.resolve(),
    )
    const onResult = vi.fn()
    const running = connectWalletsSequentially(providers, {
      abandon: vi.fn(),
      isConnected: () => false,
      connect,
      onResult,
    })
    expect(connect.mock.calls.map(([provider]) => provider)).toEqual([
      WalletProviderType.PolkadotJS,
    ])
    approve()
    await running
    expect(connect.mock.calls.map(([provider]) => provider)).toEqual(providers)
    expect(onResult).toHaveBeenLastCalledWith(
      WalletProviderType.MetaMask,
      "connected",
    )
  })

  it("continues to the next wallet when Polkadot.js rejects authorization", async () => {
    const connect = vi.fn(async (provider: WalletProviderType) => {
      if (provider === WalletProviderType.PolkadotJS)
        throw new Error("Rejected")
    })
    const onResult = vi.fn()
    await connectWalletsSequentially(providers, {
      abandon: vi.fn(),
      isConnected: () => false,
      connect,
      onResult,
    })
    expect(onResult).toHaveBeenCalledWith(
      WalletProviderType.PolkadotJS,
      "rejected",
    )
    expect(onResult).toHaveBeenLastCalledWith(
      WalletProviderType.MetaMask,
      "connected",
    )
  })

  it("rechecks wallet state after each authorization instead of reconnecting a pending or connected wallet", async () => {
    let connected = false
    const connect = vi.fn(async () => {
      connected = true
    })
    await connectWalletsSequentially(providers, {
      abandon: vi.fn(),
      isConnected: () => connected,
      connect,
      onResult: vi.fn(),
    })
    expect(connect).toHaveBeenCalledTimes(1)
  })
  it("releases an unresponsive Polkadot.js request and ignores its late approval", async () => {
    vi.useFakeTimers()
    try {
      let approve!: () => void
      const authorization = new Promise<void>((resolve) => {
        approve = resolve
      })
      const connect = vi.fn((provider: WalletProviderType) =>
        provider === WalletProviderType.PolkadotJS
          ? authorization
          : Promise.resolve(),
      )
      const abandon = vi.fn()
      const onResult = vi.fn()
      const running = connectWalletsSequentially(providers, {
        isConnected: () => false,
        connect,
        abandon,
        onResult,
      })
      await vi.advanceTimersByTimeAsync(60_000)
      await running
      expect(abandon).toHaveBeenCalledWith(WalletProviderType.PolkadotJS)
      expect(onResult).toHaveBeenCalledWith(
        WalletProviderType.PolkadotJS,
        "timedOut",
      )
      expect(onResult).toHaveBeenLastCalledWith(
        WalletProviderType.MetaMask,
        "connected",
      )
      approve()
      await Promise.resolve()
      expect(onResult).not.toHaveBeenCalledWith(
        WalletProviderType.PolkadotJS,
        "connected",
      )
    } finally {
      vi.useRealTimers()
    }
  })
})
