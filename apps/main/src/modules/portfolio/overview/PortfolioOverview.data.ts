import { useAccount } from "@galacticcouncil/web3-connect"
import Big from "big.js"

import { useMultichainPortfolio } from "@/api/portfolio"
import { useWalletBalancesSectionData } from "@/modules/portfolio/overview/Balances/WalletBalances.data"
import { useMyAssetsTableData } from "@/modules/portfolio/overview/MyAssets/MyAssetsTable.data"
import { useMyBondsTableData } from "@/modules/portfolio/overview/MyBonds/MyBondsTable.data"

export const useIsPortfolioEmpty = (): boolean => {
  const { account } = useAccount()

  const { isEmpty: isAssetsEmpty, isLoading: isAssetsTableLoading } =
    useMyAssetsTableData(true)
  const { data: bonds, isLoading: isBondsLoading } = useMyBondsTableData()
  const { liquidity, isLiquidityLoading, borrow, isBorrowLoading } =
    useWalletBalancesSectionData()
  const { byChain } = useMultichainPortfolio(
    account ? [account.rawAddress] : [],
  )

  if (
    isAssetsTableLoading ||
    isBondsLoading ||
    isLiquidityLoading ||
    isBorrowLoading
  ) {
    return false
  }

  return (
    isAssetsEmpty &&
    bonds.length === 0 &&
    Big(liquidity || 0).eq(0) &&
    Big(borrow || 0).eq(0) &&
    byChain.every(
      ({ balances, isLoading, isError }) =>
        !isLoading &&
        !isError &&
        !balances.some(({ balance }) => Big(balance.amount.toString()).gt(0)),
    )
  )
}
