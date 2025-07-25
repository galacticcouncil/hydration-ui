import { useAssets } from "providers/assets"
import { TStablepool } from "sections/pools/PoolsPage.utils"
import { useNewDepositDefaultAssetId } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetSelector.utils"

export const useSelectedDefaultAssetId = (pool: TStablepool) => {
  const { smallestPercentage, relatedAToken } = pool
  const { getErc20 } = useAssets()

  const depositAssetId = relatedAToken
    ? getErc20(relatedAToken.id)?.underlyingAssetId
    : undefined

  const { data: depositDefaultAssetId } =
    useNewDepositDefaultAssetId(depositAssetId)

  return relatedAToken ? depositDefaultAssetId : smallestPercentage?.assetId
}
