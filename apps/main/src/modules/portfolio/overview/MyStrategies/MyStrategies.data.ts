import { useEvmAddress } from "@galacticcouncil/web3-connect"
import Big from "big.js"
import { type Hex } from "viem"

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

export type StrategyPosition = {
  id: string
  strategy: "juicer" | "bil"
  assetId: string
  symbol: string
  name: string
  amount: string | null
  value: string | null
  netValue: string | null
  borrowedValue: string | null
  underlyingAmount: string | null
  underlyingSymbol: string
  transferAssetId: string | null
  rate: number | null
  rateKind: "apr" | "apy"
  shareAmount: string
  shareSymbol: string
  /** juicer yield not harvested yet; funded earnings are already in amount */
  pendingEarnings: string | null
  pendingWithdrawal: string | null
  isPendingWithdrawalEstimate: boolean
  recoveryHollar: string | null
  recoveryPending: boolean
  status: "active" | "withdrawing" | "supplied" | "wallet"
  hasPosition: boolean
  hasPendingWithdrawal: boolean
}

export const getJuicerRemainingCollateral = (
  row: PropellerWithdrawalRow,
): string => {
  if (row.state === "claimed") return "0"

  // settledSoFar includes both previous claims and collateral ready to claim.
  // Only previous claims leave the entitlement; ready collateral stays in it.
  const claimed = Big(row.settledSoFar ?? 0).minus(row.collateralSettled ?? 0)
  const remaining = Big(row.estEth).minus(claimed.gt(0) ? claimed : 0)
  return remaining.gt(0) ? remaining.toString() : "0"
}

export const useMyJuicerPositions = () => {
  const evmAddress = useEvmAddress() as Hex | undefined
  const { isReady } = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const account = usePropellerAccount(evmAddress)
  const markets = usePropellerVaults()

  const data = PROPELLER_VAULTS.flatMap<StrategyPosition>((vault) => {
    const position = account.positions.find(
      (position) => position.vault.vaultAddress === vault.vaultAddress,
    )
    const market = markets.vaults.find(
      (market) => market.vault.vaultAddress === vault.vaultAddress,
    )
    const withdrawals = account.withdrawals.filter(
      (row) =>
        row.vault.vaultAddress === vault.vaultAddress &&
        (Big(getJuicerRemainingCollateral(row)).gt(0) ||
          row.surplusHollar > 0 ||
          row.sourcePending),
    )
    if (!position && withdrawals.length === 0) return []

    const asset = getAssetWithFallback(vault.assetId)
    const amount = Big(position?.assetValue ?? 0).toString()
    const pendingWithdrawal = withdrawals.reduce(
      (sum, row) => sum.plus(getJuicerRemainingCollateral(row)),
      Big(0),
    )
    const recoveryHollar = withdrawals.reduce(
      (sum, row) => sum.plus(row.surplusHollar),
      Big(0),
    )
    const recoveryPending = withdrawals.some((row) => row.sourcePending)
    const hasPendingWithdrawal = pendingWithdrawal.gt(0)
    const pendingYield = position?.pendingYield ?? null
    const hasPosition = (position?.shares ?? 0) > 0
    const hasPrice =
      !markets.isLoading &&
      market !== undefined &&
      Number.isFinite(market.price) &&
      market.price > 0
    const value = hasPrice ? Big(amount).times(market.price).toString() : null

    return [
      {
        id: `juicer:${vault.vaultAddress}`,
        strategy: "juicer",
        assetId: vault.assetId,
        symbol: asset.symbol,
        name: vault.shareSymbol,
        amount,
        value,
        netValue: value,
        // Juicer's managed vault debt is not a personal wallet borrowing.
        borrowedValue: null,
        underlyingAmount: amount,
        underlyingSymbol: asset.symbol,
        transferAssetId: null,
        rate: market?.apy ?? null,
        rateKind: "apr",
        shareAmount: position?.sharesExact ?? "0",
        shareSymbol: vault.shareSymbol,
        pendingEarnings:
          pendingYield === null ? null : Big(pendingYield).toString(),
        pendingWithdrawal: hasPendingWithdrawal
          ? pendingWithdrawal.toString()
          : null,
        isPendingWithdrawalEstimate: withdrawals.some(
          (row) =>
            row.isEstimate && Big(getJuicerRemainingCollateral(row)).gt(0),
        ),
        recoveryHollar: recoveryHollar.gt(0) ? recoveryHollar.toString() : null,
        recoveryPending,
        status:
          hasPendingWithdrawal || recoveryHollar.gt(0) || recoveryPending
            ? "withdrawing"
            : "active",
        hasPosition,
        hasPendingWithdrawal,
      },
    ]
  })

  return {
    data,
    isLoading:
      !!evmAddress && (!isReady || account.isLoading || markets.isLoading),
    isError: account.isError,
  }
}

export const useMyBilPositions = () => {
  const evmAddress = useEvmAddress()
  const { isReady } = useRpcProvider()
  const { bil, bilReserve, hollar } = useBilStrategy()
  const balances = useUserBalances(evmAddress)
  const stats = useVaultStats()
  const pool = useBilPoolPosition(evmAddress)

  // useVaultStats has initial placeholder data; wait for its first chain read.
  const hasStats =
    stats.isFetched &&
    !stats.isError &&
    Number.isFinite(stats.data.exchangeRate) &&
    stats.data.exchangeRate > 0
  const rate =
    hasStats && Number.isFinite(stats.data.apr) ? stats.data.apr : null

  const data: StrategyPosition[] = (
    [
      { status: "supplied", shares: balances.data?.bilSupplied ?? "0" },
      { status: "wallet", shares: balances.data?.bilRaw ?? "0" },
    ] as const
  ).flatMap<StrategyPosition>(({ status, shares }) => {
    if (!Big(shares).gt(0)) return []

    const underlyingAmount = hasStats
      ? Big(shares).times(stats.data.exchangeRate).toString()
      : null
    const value = underlyingAmount
    const netValue =
      status === "supplied"
        ? pool.data
          ? Big.max(
              Big(pool.data.totalCollateralUsd).minus(pool.data.totalDebtUsd),
              0,
            ).toString()
          : null
        : value
    const borrowedValue =
      status === "supplied"
        ? pool.data
          ? Big(pool.data.totalDebtUsd).toString()
          : null
        : "0"

    return [
      {
        id: `bil:${status}`,
        strategy: "bil",
        assetId: bil.id,
        symbol: bil.symbol,
        name: "Brazilian Invoice Loans",
        amount: shares,
        value,
        netValue,
        borrowedValue,
        underlyingAmount,
        underlyingSymbol: hollar.symbol,
        // Both holdings use the strategy's BIL identity, but raw vault shares
        // (reserve 550) and supplied aTokens (55) are different transfer assets.
        transferAssetId: status === "supplied" ? bil.id : bilReserve.id,
        rate,
        rateKind: "apy",
        shareAmount: shares,
        shareSymbol: bil.symbol,
        pendingEarnings: null,
        pendingWithdrawal: null,
        isPendingWithdrawalEstimate: false,
        recoveryHollar: null,
        recoveryPending: false,
        status,
        hasPosition: true,
        hasPendingWithdrawal: false,
      },
    ]
  })

  return {
    data,
    isLoading:
      !!evmAddress &&
      (!isReady ||
        balances.isLoading ||
        pool.isLoading ||
        stats.isLoading ||
        (!stats.isFetched && stats.isFetching)),
    isError: balances.isError || stats.isError || pool.isError,
  }
}
