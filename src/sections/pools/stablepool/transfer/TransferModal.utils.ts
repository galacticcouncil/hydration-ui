import { TAsset, useAssets } from "providers/assets"
import { useNewDepositDefaultAssetId } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetSelector.utils"

export const useSelectedDefaultAssetId = ({
  stablepoolAsset,
  smallestPercentage,
}: {
  stablepoolAsset: TAsset
  smallestPercentage?: {
    assetId: string
    percentage: number
  }
}) => {
  const { isErc20, getErc20 } = useAssets()

  const depositAssetId = isErc20(stablepoolAsset)
    ? getErc20(stablepoolAsset.id)?.underlyingAssetId
    : undefined

  const { data: depositDefaultAssetId } =
    useNewDepositDefaultAssetId(depositAssetId)

  return depositAssetId ? depositDefaultAssetId : smallestPercentage?.assetId
}
