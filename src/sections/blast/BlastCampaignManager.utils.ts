import { useBorrowAssetsApy } from "api/borrow"
import { useAccountAssets } from "sections/wallet/assets/table/data/WalletAssetsTableData.utils"
import { HUSDC_ASSET_ID, USDC_ASSET_ID } from "utils/constants"

export const WINNING_ASSET_IDS = [
  "1001187", // Blast
  "1001191", // Falc
  "1001188", // Furia
  "1001110", // G2
  "1001194", // Mongz
  "1001189", // Pain
  "1001190", // Passion
  "1001192", // Spirit
  "1001195", // Tyloo
  "1001193", // Vit
]

export const useBlastCampaign = () => {
  const { data, isLoading: isLoadingAccountAssets } = useAccountAssets()
  const { data: rewardPoolApy, isLoading: isLoadingRewardPoolApy } =
    useBorrowAssetsApy([HUSDC_ASSET_ID])

  const winningAssetIds = data
    ? data
        .filter((asset) => WINNING_ASSET_IDS.includes(asset.id))
        .map((asset) => asset.id)
    : []

  const hasWinningAsset = winningAssetIds.length > 0

  const hasRewardAsset = data
    ? data.some((asset) => USDC_ASSET_ID === asset.id)
    : false

  const isLoading = isLoadingAccountAssets || isLoadingRewardPoolApy

  return {
    rewardApy: rewardPoolApy?.[0]?.totalSupplyApy.toString() ?? "",
    hasWinningAsset,
    hasRewardAsset,
    winningAssetIds,
    isLoading,
  }
}
