import { useBorrowAssetsApy } from "api/borrow"
import { BLAST_ASSETS } from "sections/wallet/addToken/AddToken.utils"
import { useAccountAssets } from "sections/wallet/assets/table/data/WalletAssetsTableData.utils"
import { HUSDC_ASSET_ID, USDC_ASSET_ID } from "utils/constants"

const WINNING_ASSET_IDS = BLAST_ASSETS.map((asset) => asset.internalId)

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
