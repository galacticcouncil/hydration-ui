import { useTokenBalance } from "api/balances"
import BigNumber from "bignumber.js"
import { useAsset } from "api/asset"

export function useAddPoolAddLiquidity(assetId: string) {
  const asset = useAsset(assetId)
  const balance = useTokenBalance(assetId)

  const queries = [asset, balance]
  const isLoading = queries.some((q) => q.isLoading)

  return {
    isLoading,
    data: {
      asset: asset.data,
      balance: balance.data ?? new BigNumber(NaN),
    },
  }
}
