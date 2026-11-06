import { bigShift } from "@galacticcouncil/utils"
import { useEvmAddress } from "@galacticcouncil/web3-connect"
import Big from "big.js"
import { useMemo } from "react"

import { AssetType } from "@/api/assets"
import { Balance, useAccountBalancesWithPriceByAssetType } from "@/api/balances"
import { useUserBorrowSummary, useUserGigaBorrowSummary } from "@/api/borrow"
import { useMyIsolatedPoolsLiquidity } from "@/modules/portfolio/overview/MyLiquidity/MyIsolatedPoolsLiquidity.data"
import { useMyVaultLiquidity } from "@/modules/portfolio/overview/MyLiquidity/MyVaultLiquidity.data"
import { useMyJuicerPositions } from "@/modules/portfolio/overview/MyStrategies/MyStrategies.data"
import { useBilPoolPosition } from "@/modules/strategies/bil/hooks/useBilPoolPosition"
import {
  isOmnipoolDepositPosition,
  useAccountOmnipoolPositionsData,
} from "@/states/account"

const calculateBalancesTotal = (
  balances: Array<{
    balance: Balance
    meta: { decimals: number }
    price?: string
  }>,
) => {
  if (!balances) return Big(0)

  return balances.reduce((acc, { balance, meta, price }) => {
    const balanceShifted = bigShift(balance.total.toString(), -meta.decimals)
    const displayValue = price ? balanceShifted.times(price).toString() : "0"
    return acc.plus(displayValue)
  }, Big(0))
}

export const useWalletBalancesSectionData = () => {
  const { data: positions, isLoading: isLoadingPositions } =
    useAccountOmnipoolPositionsData()

  const {
    data: isolatedPoolsLiquidity,
    isLoading: isLoadingIsolatedPoolsLiquidity,
  } = useMyIsolatedPoolsLiquidity()

  const { data: vaultLiquidity, isLoading: isLoadingVaultLiquidity } =
    useMyVaultLiquidity()

  const { data: userBorrowSummary, isLoading: isLoadingBorrowSummary } =
    useUserBorrowSummary()
  const evmAddress = useEvmAddress()
  const gigaBorrowSummary = useUserGigaBorrowSummary()
  const bilPoolPosition = useBilPoolPosition(evmAddress)
  // Juicer withdrawals in flight: the shares sit in the vault's escrow, so no
  // wallet balance holds them until the claim — count them as assets
  const juicer = useMyJuicerPositions()
  const juicerPendingUsd = juicer.data.reduce(
    (sum, position) => sum.plus(position.pendingWithdrawalValue ?? 0),
    Big(0),
  )

  const { data: balancesWithPrice, isSettled: isBalanceSettled } =
    useAccountBalancesWithPriceByAssetType([
      AssetType.STABLESWAP,
      AssetType.TOKEN,
      AssetType.ERC20,
    ])

  const { liquidityTotal, farmingTotal, assetsTotal } = useMemo(() => {
    const omnipoolLiquidity = (positions?.all ?? []).reduce(
      (acc, position) => {
        acc.liquidity = acc.liquidity.plus(
          position.data?.currentTotalDisplay ?? 0,
        )

        if (isOmnipoolDepositPosition(position)) {
          acc.farming = acc.farming.plus(
            position.data?.currentTotalDisplay ?? 0,
          )
        }

        return acc
      },
      {
        liquidity: Big(0),
        farming: Big(0),
      },
    )

    const isolatedPoolsLiquidityTotals = isolatedPoolsLiquidity.reduce(
      (acc, asset) => {
        acc.liquidity = acc.liquidity.plus(asset.currentTotalDisplay ?? 0)
        acc.farming = acc.farming.plus(
          asset.positions.reduce((acc, position) => {
            const displaValue = bigShift(
              position.shares.toString(),
              -position.meta.decimals,
            ).times(position.price)

            return acc.plus(displaValue ?? 0)
          }, Big(0)),
        )
        return acc
      },
      { liquidity: Big(0), farming: Big(0) },
    )

    const vaultLiquidityTotal = vaultLiquidity.reduce(
      (acc, vault) => acc.plus(vault.currentTotalDisplay),
      Big(0),
    )

    const tokensTotal = calculateBalancesTotal(
      balancesWithPrice?.tokenBalances ?? [],
    )

    const erc20Total = calculateBalancesTotal(
      balancesWithPrice?.erc20Balances ?? [],
    )

    const stableSwapTotal = calculateBalancesTotal(
      balancesWithPrice?.stableSwapBalances ?? [],
    )

    const assetsTotal = tokensTotal.plus(erc20Total)

    const liquidityTotal = omnipoolLiquidity.liquidity
      .plus(stableSwapTotal)
      .plus(isolatedPoolsLiquidityTotals.liquidity)
      .plus(vaultLiquidityTotal)

    const farmingTotal = omnipoolLiquidity.farming.plus(
      isolatedPoolsLiquidityTotals.farming,
    )

    return { omnipoolLiquidity, assetsTotal, liquidityTotal, farmingTotal }
  }, [
    balancesWithPrice,
    isolatedPoolsLiquidity,
    positions?.all,
    vaultLiquidity,
  ])

  const giga = gigaBorrowSummary.data?.userSummary
  const bil = bilPoolPosition.data
  const supplyByMarket = {
    main: userBorrowSummary?.totalLiquidityUSD || "0",
    giga: giga?.totalLiquidityUSD || "0",
    bil: String(bil?.totalCollateralUsd ?? 0),
  }
  const borrowByMarket = {
    main: userBorrowSummary?.totalBorrowsUSD || "0",
    giga: giga?.totalBorrowsUSD || "0",
    bil: String(bil?.totalDebtUsd ?? 0),
  }

  return {
    assets: assetsTotal.plus(juicerPendingUsd).toString(),
    isAssetsLoading: !isBalanceSettled || juicer.isLoading,
    liquidity: liquidityTotal.toString(),
    farms: farmingTotal.toString(),
    isLiquidityLoading:
      isLoadingIsolatedPoolsLiquidity ||
      isLoadingPositions ||
      isLoadingVaultLiquidity,
    supply: Big(supplyByMarket.main)
      .plus(supplyByMarket.giga)
      .plus(supplyByMarket.bil)
      .toString(),
    borrow: Big(borrowByMarket.main)
      .plus(borrowByMarket.giga)
      .plus(borrowByMarket.bil)
      .toString(),
    supplyByMarket,
    borrowByMarket,
    isBorrowLoading:
      isLoadingBorrowSummary ||
      (!!evmAddress &&
        (gigaBorrowSummary.isPending || bilPoolPosition.isPending)),
  }
}
