import { u32 } from "@polkadot/types"
import { UseAssetModel } from "api/asset"
import { useAssetAccountDetails, useAssetDetailsList } from "api/assetDetails"
import { useTranslation } from "react-i18next"
import { useAccountStore } from "state/store"
import { Maybe } from "utils/helpers"
import { Text } from "../../components/Typography/Text/Text"
import { SAssetsModalHeader } from "./AssetsModal.styled"
import { AssetsModalRow } from "./AssetsModalRow"
import { AssetsModalRowSkeleton } from "./AssetsModalRowSkeleton"

type Props = {
  allowedAssets?: Maybe<u32 | string>[]
  onSelect?: (asset: NonNullable<UseAssetModel>) => void
  hideInactiveAssets?: boolean
  allAssets?: boolean
}

export const AssetsModalContent = ({
  allowedAssets,
  onSelect,
  hideInactiveAssets,
  allAssets,
}: Props) => {
  const { t } = useTranslation()
  const { account } = useAccountStore()

  const assetsRows = useAssetAccountDetails(account?.address)
  const assetsRowsAll = useAssetDetailsList(allAssets ? undefined : [])

  const assets = allAssets ? assetsRowsAll : assetsRows

  const mainAssets =
    (allowedAssets != null
      ? assets.data?.filter((asset) => allowedAssets.includes(asset.id))
      : assets.data) ?? []

  const otherAssets =
    (allowedAssets != null
      ? assets.data?.filter((asset) => !allowedAssets?.includes(asset.id))
      : []) ?? []

  const isLoading = assetsRows.isLoading || assetsRowsAll.isLoading

  if (isLoading || !mainAssets.length)
    return (
      <>
        <SAssetsModalHeader>
          <Text color="basic700" fw={500} fs={12} tTransform="uppercase">
            {t("selectAssets.asset")}
          </Text>
          <Text color="basic700" fw={500} fs={12} tTransform="uppercase">
            {t("selectAssets.your_balance")}
          </Text>
        </SAssetsModalHeader>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <AssetsModalRowSkeleton key={n} />
        ))}
      </>
    )

  return (
    <>
      {!!mainAssets?.length && (
        <>
          <SAssetsModalHeader>
            <Text color="basic700" fw={500} fs={12} tTransform="uppercase">
              {t("selectAssets.asset")}
            </Text>
            <Text color="basic700" fw={500} fs={12} tTransform="uppercase">
              {t("selectAssets.your_balance")}
            </Text>
          </SAssetsModalHeader>
          {mainAssets?.map((asset) => (
            <AssetsModalRow
              key={asset.id}
              id={asset.id}
              onClick={(assetData) => onSelect?.(assetData)}
            />
          ))}
        </>
      )}
      {!hideInactiveAssets && !!otherAssets?.length && (
        <>
          <SAssetsModalHeader shadowed>
            <Text color="basic700" fw={500} fs={12} tTransform="uppercase">
              {t("selectAssets.asset_without_pair")}
            </Text>
          </SAssetsModalHeader>
          {otherAssets?.map((asset) => (
            <AssetsModalRow key={asset.id} id={asset.id} />
          ))}
        </>
      )}
    </>
  )
}
