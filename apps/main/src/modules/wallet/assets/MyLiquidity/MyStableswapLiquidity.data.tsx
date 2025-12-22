import { AssetType } from "@/api/assets"
import { useAccountBalancesWithPriceByAssetType } from "@/states/account"
import { toBig } from "@/utils/formatting"

export const useMyStableswapLiquidity = () => {
  const { data: balancesWithPrice, isLoading: isBalanceLoading } =
    useAccountBalancesWithPriceByAssetType([AssetType.STABLESWAP])

  return {
    data:
      balancesWithPrice?.stableSwapBalances.map(({ balance, meta, price }) => {
        const total = toBig(balance.transferable, meta.decimals)
        const totalDisplay = price ? total.times(price).toString() : "0"

        return {
          data: {
            currentValueHuman: total.toString(),
            currentTotalDisplay: totalDisplay.toString(),
            currentHubValueHuman: "0",
            initialValue: undefined,
            meta,
          },
          assetId: meta.id,
        }
      }) ?? [],
    isLoading: isBalanceLoading,
  }
}
