import { patchBigJs } from "@galacticcouncil/utils/src/lib/patchBigJs"
import { useEvmAddress } from "@galacticcouncil/web3-connect"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useBilStrategy } from "@/modules/strategies/bil/context/BilStrategyContext"
import { useBilPoolPosition } from "@/modules/strategies/bil/hooks/useBilPoolPosition"
import {
  useUserBalances,
  useVaultStats,
} from "@/modules/strategies/bil/hooks/useVaultReads"
import { PROPELLER_VAULTS } from "@/modules/strategies/propeller/config/vaults"
import {
  type PropellerWithdrawalRow,
  usePropellerAccount,
} from "@/modules/strategies/propeller/hooks/usePropellerAccount"
import { usePropellerVaults } from "@/modules/strategies/propeller/hooks/usePropellerVaults"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

import {
  getJuicerRemainingCollateral,
  useMyBilPositions,
  useMyJuicerPositions,
} from "./MyStrategies.data"

vi.mock("@galacticcouncil/web3-connect", () => ({ useEvmAddress: vi.fn() }))
vi.mock("@/modules/strategies/bil/context/BilStrategyContext", () => ({
  useBilStrategy: vi.fn(),
}))
vi.mock("@/modules/strategies/bil/hooks/useBilPoolPosition", () => ({
  useBilPoolPosition: vi.fn(),
}))
vi.mock("@/modules/strategies/bil/hooks/useVaultReads", () => ({
  useUserBalances: vi.fn(),
  useVaultStats: vi.fn(),
}))
vi.mock("@/modules/strategies/propeller/hooks/usePropellerAccount", () => ({
  usePropellerAccount: vi.fn(),
}))
vi.mock(
  "@/modules/strategies/propeller/hooks/usePropellerVaults",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("@/modules/strategies/propeller/hooks/usePropellerVaults")
    >()),
    usePropellerVaults: vi.fn(),
  }),
)
// The real usePropellerVaults module is kept for vaultDepositState.
// The denomination store is a real zustand hook; stub it for plain-function calls.
vi.mock("@/modules/strategies/propeller/hooks/useCollateralEquivalent", () => ({
  useBaseRates: () => ({ getRate: () => "1", isLoading: false }),
  useVaultDisplayAsset:
    () => (vault: { assetId: string; baseAssetId?: string }) => ({
      id: vault.baseAssetId ?? vault.assetId,
      symbol: vault.baseAssetId ? "ETH" : "tBTC",
    }),
}))
vi.mock("@/api/borrow", () => ({}))
vi.mock("@/modules/strategies/propeller/hooks/useVaultReads", () => ({}))
vi.mock("@/states/displayAsset", () => ({}))
vi.mock("@/providers/assetsProvider", () => ({ useAssets: vi.fn() }))
vi.mock("@/providers/rpcProvider", () => ({ useRpcProvider: vi.fn() }))

const vault = PROPELLER_VAULTS[0]!
const withdrawal = (
  overrides: Partial<PropellerWithdrawalRow> = {},
): PropellerWithdrawalRow => ({
  id: `${vault.vaultAddress}:1`,
  requestId: 1,
  vault,
  amountShares: 1,
  estEth: 1,
  estUsd: 2500,
  state: "pending",
  claimableInSeconds: null,
  reserveShort: false,
  settledSoFar: 0,
  collateralSettled: 0,
  eligibleAt: 0,
  mainDebt: "0x0000000000000000000000000000000000000001",
  surplusHollar: 0,
  sourcePending: false,
  ...overrides,
})

beforeEach(() => {
  vi.resetAllMocks()
  patchBigJs()
  vi.mocked(useEvmAddress).mockReturnValue(
    "0x0000000000000000000000000000000000000001",
  )
  vi.mocked(useRpcProvider).mockReturnValue({
    isReady: true,
  } as ReturnType<typeof useRpcProvider>)
  vi.mocked(useAssets).mockReturnValue({
    getAssetWithFallback: (id: string) => ({
      id,
      symbol:
        id === vault.assetId
          ? "GIGAETH"
          : id === vault.baseAssetId
            ? "ETH"
            : "tBTC",
    }),
  } as ReturnType<typeof useAssets>)
  vi.mocked(usePropellerAccount).mockReturnValue({
    positions: [],
    withdrawals: [],
    isLoading: false,
    isError: false,
  })
  vi.mocked(usePropellerVaults).mockReturnValue({
    vaults: PROPELLER_VAULTS.map((vault) => ({
      vault,
      deployedFraction: null,
      accrualPaused: false,
      apy: 6.5,
      runRateApy: 6.5,
      price: 2500,
    })),
    isLoading: false,
  } as ReturnType<typeof usePropellerVaults>)
  vi.mocked(useBilStrategy).mockReturnValue({
    bil: { id: "55", symbol: "BIL" },
    bilReserve: { id: "550", symbol: "DCL" },
    hollar: { id: "222", symbol: "HOLLAR" },
  } as ReturnType<typeof useBilStrategy>)
  vi.mocked(useUserBalances).mockReturnValue({
    data: { bilRaw: "0", bilSupplied: "0" },
    isLoading: false,
    isError: false,
  } as ReturnType<typeof useUserBalances>)
  vi.mocked(useVaultStats).mockReturnValue({
    data: { exchangeRate: 1.2, apr: 12 },
    isFetched: true,
    isLoading: false,
    isFetching: false,
    isError: false,
  } as ReturnType<typeof useVaultStats>)
  vi.mocked(useBilPoolPosition).mockReturnValue({
    data: { totalCollateralUsd: 0, totalDebtUsd: 0 },
    isLoading: false,
    isError: false,
  } as ReturnType<typeof useBilPoolPosition>)
})

const remaining = (overrides: Partial<PropellerWithdrawalRow>) =>
  getJuicerRemainingCollateral({
    state: "pending",
    estEth: 1,
    ...overrides,
  } as PropellerWithdrawalRow)

describe("Juicer portfolio withdrawal entitlement", () => {
  it("keeps the full estimated entitlement during cooldown", () => {
    expect(remaining({ state: "cooldown", estEth: 0.125 })).toBe("0.125")
  })

  it("keeps unfunded started collateral pending", () => {
    expect(remaining({ settledSoFar: 0, collateralSettled: 0 })).toBe("1")
  })

  it("does not subtract collateral that settled but has not been claimed", () => {
    expect(
      remaining({
        state: "partial",
        settledSoFar: 0.4,
        collateralSettled: 0.4,
      }),
    ).toBe("1")
  })

  it("takes estEth as is: it already excludes previous partial claims", () => {
    // owed 1, claimed 0.4, ready 0.3 -> 0.6 still coming (0.3 of it claimable)
    expect(
      remaining({
        state: "partial",
        estEth: 0.6,
        settledSoFar: 0.7,
        collateralSettled: 0.3,
      }),
    ).toBe("0.6")
  })

  it("retains a fully settled entitlement until the user claims it", () => {
    expect(
      remaining({
        state: "settled",
        settledSoFar: 1,
        collateralSettled: 1,
      }),
    ).toBe("1")
    expect(
      remaining({
        state: "settled",
        estEth: 0.6,
        settledSoFar: 1,
        collateralSettled: 0.6,
      }),
    ).toBe("0.6")
  })

  it("excludes claimed collateral even when HOLLAR recovery remains", () => {
    expect(
      remaining({
        state: "claimed",
        settledSoFar: 1,
        collateralSettled: 0,
        surplusHollar: 5,
        sourcePending: true,
      }),
    ).toBe("0")
  })

  it("clamps a rounding-negative entitlement instead of showing a negative holding", () => {
    expect(remaining({ state: "partial", estEth: -0.000001 })).toBe("0")
  })
})

describe("Portfolio strategy position projection", () => {
  it("tags active Juicer collateral and keeps pending yield outside its live value", () => {
    vi.mocked(usePropellerAccount).mockReturnValue({
      positions: [
        {
          vault,
          shares: 1.8,
          sharesExact: "1.800000000000000001",
          assetValue: 2,
          usdValue: 5000,
          deployedFraction: null,
          accrualPaused: false,
          apy: 6.5,
          pendingYield: 0.03,
          collateralBalance: 0,
          harvestStatus: null,
        },
      ],
      withdrawals: [],
      isLoading: false,
      isError: false,
    })

    const result = useMyJuicerPositions()
    expect(result.isLoading).toBe(false)
    expect(result.data).toHaveLength(1)
    expect(result.data[0]).toMatchObject({
      id: `juicer:${vault.vaultAddress}`,
      strategy: "juicer",
      // the user-facing identity is the base asset; shares stay internal
      assetId: vault.baseAssetId,
      symbol: "ETH",
      name: "Juicer ETH",
      shareSymbol: "jETH",
      amount: "2",
      value: "5000",
      netValue: "5000",
      borrowedValue: null,
      underlyingAmount: "2",
      underlyingSymbol: "ETH",
      transferAssetId: null,
      shareAmount: "1.800000000000000001",
      rate: 6.5,
      rateKind: "apr",
      pendingEarnings: "0.03",
      status: "active",
      hasPosition: true,
      hasPendingWithdrawal: false,
    })
  })

  it("keeps deposit navigation for an open active position with no idle balance, and prioritizes claims", () => {
    const openStats = {
      paused: false,
      depositsPaused: false,
      deficitStop: false,
      remaining: 10,
    }
    const useAction = ({
      collateralBalance = 1,
      stats = openStats,
      withdrawals = [] as PropellerWithdrawalRow[],
    } = {}) => {
      vi.mocked(usePropellerAccount).mockReturnValue({
        positions: [
          {
            vault,
            shares: 1,
            sharesExact: "1",
            assetValue: 1,
            usdValue: 2500,
            deployedFraction: null,
            accrualPaused: false,
            apy: 6.5,
            pendingYield: null,
            collateralBalance,
            harvestStatus: null,
          },
        ],
        withdrawals,
        isLoading: false,
        isError: false,
      })
      vi.mocked(usePropellerVaults).mockReturnValue({
        vaults: PROPELLER_VAULTS.map((vault) => ({
          vault,
          deployedFraction: null,
          accrualPaused: false,
          apy: 6.5,
          price: 2500,
          stats,
        })),
        isLoading: false,
      } as ReturnType<typeof usePropellerVaults>)
      return useMyJuicerPositions().data[0]?.action
    }

    expect(useAction()).toBe("deposit")
    expect(useAction({ collateralBalance: 0 })).toBe("deposit")
    expect(useAction({ collateralBalance: 0.000001 })).toBe("deposit")
    expect(useAction({ stats: { ...openStats, remaining: 0 } })).toBeNull()
    expect(
      useAction({ stats: { ...openStats, depositsPaused: true } }),
    ).toBeNull()
    expect(
      useAction({ withdrawals: [withdrawal({ state: "cooldown" })] }),
    ).toBeNull()
    expect(
      useAction({
        withdrawals: [withdrawal({ state: "partial", collateralSettled: 0.5 })],
      }),
    ).toBe("claim")
  })

  it("includes a withdrawal-only vault without presenting the entitlement as active collateral", () => {
    vi.mocked(usePropellerAccount).mockReturnValue({
      positions: [],
      withdrawals: [
        withdrawal({ state: "cooldown", estEth: 1.25, isEstimate: true }),
      ],
      isLoading: false,
      isError: false,
    })

    expect(useMyJuicerPositions().data).toHaveLength(1)
    expect(useMyJuicerPositions().data[0]).toMatchObject({
      amount: "0",
      value: "0",
      shareAmount: "0",
      pendingWithdrawal: "1.25",
      isPendingWithdrawalEstimate: true,
      status: "withdrawing",
      hasPosition: false,
      hasPendingWithdrawal: true,
    })
  })

  it("keeps pending yield visible once the whole balance is in a withdrawal", () => {
    vi.mocked(usePropellerAccount).mockReturnValue({
      positions: [
        {
          vault,
          shares: 0,
          sharesExact: "0",
          assetValue: 0,
          usdValue: 0,
          deployedFraction: null,
          accrualPaused: false,
          apy: 6.5,
          pendingYield: 0.004,
          collateralBalance: 0,
          harvestStatus: null,
        },
      ],
      withdrawals: [withdrawal({ state: "cooldown", estEth: 1 })],
      isLoading: false,
      isError: false,
    })

    expect(useMyJuicerPositions().data[0]).toMatchObject({
      shareAmount: "0",
      pendingEarnings: "0.004",
      pendingWithdrawal: "1",
      status: "withdrawing",
      hasPosition: false,
    })
  })

  it("excludes fully claimed withdrawals with no remaining recovery", () => {
    vi.mocked(usePropellerAccount).mockReturnValue({
      positions: [],
      withdrawals: [withdrawal({ state: "claimed", settledSoFar: 1 })],
      isLoading: false,
      isError: false,
    })

    expect(useMyJuicerPositions().data).toEqual([])
  })

  it("keeps HOLLAR recovery visible after collateral was fully claimed", () => {
    vi.mocked(usePropellerAccount).mockReturnValue({
      positions: [],
      withdrawals: [
        withdrawal({
          state: "claimed",
          settledSoFar: 1,
          surplusHollar: 7.5,
          sourcePending: true,
        }),
      ],
      isLoading: false,
      isError: false,
    })

    expect(useMyJuicerPositions().data[0]).toMatchObject({
      amount: "0",
      value: "0",
      pendingWithdrawal: null,
      recoveryHollar: "7.5",
      recoveryPending: true,
      hasPosition: false,
      hasPendingWithdrawal: false,
      status: "withdrawing",
    })
  })

  it("leaves value unknown while Juicer market pricing loads", () => {
    vi.mocked(usePropellerAccount).mockReturnValue({
      positions: [
        {
          vault,
          shares: 1,
          sharesExact: "1",
          assetValue: 1,
          usdValue: 0,
          deployedFraction: null,
          accrualPaused: false,
          apy: null,
          pendingYield: null,
          collateralBalance: 0,
          harvestStatus: null,
        },
      ],
      withdrawals: [],
      isLoading: false,
      isError: false,
    })
    vi.mocked(usePropellerVaults).mockReturnValue({
      vaults: [],
      subLoop: undefined,
      upToApy: null,
      totalTvlUsd: 0,
      isLoading: true,
    })

    const result = useMyJuicerPositions()
    expect(result.isLoading).toBe(true)
    expect(result.data[0]).toMatchObject({ amount: "1", value: null })
  })

  it("retains known BIL shares but does not use placeholder collateral conversion", () => {
    vi.mocked(useUserBalances).mockReturnValue({
      data: { bilRaw: "10", bilSupplied: "0" },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useUserBalances>)
    vi.mocked(useVaultStats).mockReturnValue({
      data: { exchangeRate: 1, apr: 18 },
      isFetched: false,
      isLoading: false,
      isFetching: true,
      isError: false,
    } as ReturnType<typeof useVaultStats>)

    const result = useMyBilPositions()
    expect(result.isLoading).toBe(true)
    expect(result.data[0]).toMatchObject({
      strategy: "bil",
      assetId: "55",
      symbol: "BIL",
      amount: "10",
      value: null,
      netValue: null,
      borrowedValue: "0",
      underlyingAmount: null,
      underlyingSymbol: "HOLLAR",
      transferAssetId: "550",
      shareAmount: "10",
      shareSymbol: "BIL",
      rate: null,
      rateKind: "apy",
      status: "wallet",
    })
  })

  it("shows BIL-owned shares and gross value with separate borrowing and transfer identities", () => {
    vi.mocked(useUserBalances).mockReturnValue({
      data: { bilRaw: "50", bilSupplied: "100" },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useUserBalances>)
    vi.mocked(useBilPoolPosition).mockReturnValue({
      data: { totalCollateralUsd: 120, totalDebtUsd: 30 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useBilPoolPosition>)

    const result = useMyBilPositions()
    expect(result.data).toHaveLength(2)
    expect(result.data[0]).toMatchObject({
      id: "bil:supplied",
      assetId: "55",
      symbol: "BIL",
      name: "Brazilian Invoice Loans",
      amount: "100",
      value: "120",
      netValue: "90",
      borrowedValue: "30",
      underlyingAmount: "120",
      underlyingSymbol: "HOLLAR",
      transferAssetId: "55",
      shareAmount: "100",
      status: "supplied",
      rate: 12,
      rateKind: "apy",
    })
    expect(result.data[1]).toMatchObject({
      id: "bil:wallet",
      assetId: "55",
      symbol: "BIL",
      amount: "50",
      value: "60",
      netValue: "60",
      borrowedValue: "0",
      underlyingAmount: "60",
      underlyingSymbol: "HOLLAR",
      transferAssetId: "550",
      shareAmount: "50",
      status: "wallet",
    })
  })

  it("retains gross BIL holdings while supplied debt accounting is unavailable", () => {
    vi.mocked(useUserBalances).mockReturnValue({
      data: { bilRaw: "0", bilSupplied: "100" },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useUserBalances>)
    vi.mocked(useBilPoolPosition).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useBilPoolPosition>)

    const result = useMyBilPositions()
    expect(result.isError).toBe(true)
    expect(result.data[0]).toMatchObject({
      amount: "100",
      value: "120",
      netValue: null,
      borrowedValue: null,
      underlyingAmount: "120",
      transferAssetId: "55",
    })
  })
})
