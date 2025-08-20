import { useUserData } from "@galacticcouncil/money-market/hooks"

import { useMyLiquidityAmount } from "@/modules/liquidity/components/PoolsHeader/MyLiquidity.data"

export const useWalletBalancesSectionData = () => {
  const { totalAmount, omnipool, isLoading, isLoadingPositions } =
    useMyLiquidityAmount()
  const { totalBorrowsUSD, totalLiquidityUSD, loading } = useUserData()

  return {
    liquidity: totalAmount,
    farms: omnipool?.farming.toString() ?? "0",
    isLiquidityLoading: isLoading || isLoadingPositions,
    supply: totalLiquidityUSD,
    borrow: totalBorrowsUSD,
    isBorrowLoading: loading,
  }
}
