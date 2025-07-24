import { TAsset, useAssets } from "providers/assets"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { TStablepool } from "sections/pools/PoolsPage.utils"
import { useNewDepositAssets } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetSelector.utils"

type TransferAssetSelectorProps = {
  pool: TStablepool
  firstAssetId?: string
  onSelect: (asset: NonNullable<TAsset>) => void
}

const TransferErc20AssetSelector: React.FC<TransferAssetSelectorProps> = ({
  pool,
  firstAssetId,
  onSelect,
}) => {
  const { getErc20 } = useAssets()
  const depositAssetId = pool.relatedAToken
    ? getErc20(pool.relatedAToken.id)?.underlyingAssetId
    : undefined

  const selectableAssets = useNewDepositAssets(depositAssetId ?? "", {
    firstAssetId,
  })

  return (
    <AssetsModalContent
      hideInactiveAssets
      allowedAssets={selectableAssets}
      displayZeroBalance
      naturallySorted
      onSelect={onSelect}
    />
  )
}

const TransferStabepoolAssetSelector: React.FC<TransferAssetSelectorProps> = ({
  pool,
  onSelect,
}) => {
  const assetIds = Object.keys(pool.meta.meta ?? {})
  console.log({ assetIds })
  return (
    <AssetsModalContent
      hideInactiveAssets
      allowedAssets={assetIds}
      displayZeroBalance
      onSelect={onSelect}
    />
  )
}

export const TransferAssetSelector: React.FC<TransferAssetSelectorProps> = (
  props,
) => {
  const hasAToken = !!props.pool.relatedAToken

  if (hasAToken) {
    return <TransferErc20AssetSelector {...props} />
  }

  return <TransferStabepoolAssetSelector {...props} />
}
