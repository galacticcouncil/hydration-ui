import { TAsset, TErc20, useAssets } from "providers/assets"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { useNewDepositAssets } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetSelector.utils"
import { GETH_ERC20_ASSET_ID } from "utils/constants"

type TransferAssetSelectorProps = {
  stablepoolAsset: TAsset
  firstAssetId?: string
  onSelect: (asset: NonNullable<TAsset>) => void
}

const TransferErc20AssetSelector: React.FC<
  TransferAssetSelectorProps & { stablepoolAsset: TErc20 }
> = ({ stablepoolAsset, firstAssetId, onSelect }) => {
  const { native } = useAssets()

  const depositAssetId = stablepoolAsset.underlyingAssetId ?? ""

  const selectableAssets = useNewDepositAssets(depositAssetId, {
    blacklist:
      stablepoolAsset.id !== GETH_ERC20_ASSET_ID ? [stablepoolAsset.id] : [],
    firstAssetId,
    lowPriorityAssetIds: [native.id],
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
  stablepoolAsset,
  onSelect,
}) => {
  const assetIds = Object.keys(stablepoolAsset.meta ?? {})

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
  const { isErc20 } = useAssets()

  if (isErc20(props.stablepoolAsset)) {
    return <TransferErc20AssetSelector {...props} />
  }

  return <TransferStabepoolAssetSelector {...props} />
}
