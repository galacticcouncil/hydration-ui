import { describe, expect, it, vi } from "vitest"

import { VaultSnapshot, VaultState } from "@/api/gamma/vaults"
import { V3PoolBase } from "@/api/pools"
import { toVaultRow } from "@/modules/liquidity/Vaults.utils"
import { TAsset } from "@/providers/assetsProvider"

// toVaultRow is pure; stub the hook modules so the app graph isn't loaded.
vi.mock("@/api/gamma/vaults", () => ({}))
vi.mock("@/api/neckwork", () => ({}))
vi.mock("@/api/pools", () => ({}))
vi.mock("@/providers/assetsProvider", () => ({}))
vi.mock("@/states/displayAsset", () => ({}))

const sdkPool = {
  address: "0x0000000000000000000000000000000000000001",
  token0: 1,
  token1: 2,
  fee: 3000,
  tick: 0,
  sqrtPriceX96: 2n ** 96n,
  liquidity: 1n,
} as V3PoolBase

const vault = {
  uniProxy: "0x00000000000000000000000000000000000000aa",
  whitelisted: "0x00000000000000000000000000000000000000aa",
  baseLower: -100,
  baseUpper: 100,
  totalSupply: 10n,
  total0: 1_000_000n,
  total1: 1_000_000n,
} as Partial<VaultState> as VaultState

const snapshot = (tick: number): VaultSnapshot => ({
  pool: {
    sqrtPriceX96: 2n ** 96n,
    tick,
    liquidity: 5n,
    reserve0: 2_000_000n,
    reserve1: 2_000_000n,
    lpFeeShare: 1,
  },
  vault,
})

const row = (snap: VaultSnapshot | null) =>
  toVaultRow({
    pool: sdkPool,
    snapshot: snap,
    isSnapshotLoading: false,
    positionShares: 5n,
    volumes: [],
    isVolumeLoading: false,
    getAssetWithFallback: (id) => ({ id, decimals: 6 }) as TAsset,
    getAssetPrice: () => ({ price: "1", isLoading: false, isValid: true }),
  })

describe("toVaultRow", () => {
  it("judges range on the snapshot's tick, not the SDK pool's", () => {
    // SDK tick 0 sits inside the band; the live read says the price left it.
    expect(row(snapshot(500)).status).toBe("outOfRange")
    expect(row(snapshot(50)).status).toBe("inRange")
    expect(row(snapshot(500)).pool.tick).toBe(500)
  })

  it("values the pool at what its contract holds, the vault at its totals", () => {
    const r = row(snapshot(0))
    expect(r.tvlDisplay).toBe("4")
    expect(r.vaultTvlDisplay).toBe("2")
    expect(r.positionValueDisplay).toBe("1")
  })

  it("has no vault and no TVL before the snapshot lands", () => {
    const r = row(null)
    expect(r.status).toBe("noVault")
    expect(r.tvlDisplay).toBeUndefined()
  })
})
