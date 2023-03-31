import { ModalMeta } from "components/Modal/Modal"
import { FC } from "react"
import { AssetsModalRow } from "./AssetsModalRow"
import { SAssetsModalHeader } from "./AssetsModal.styled"
import { u32 } from "@polkadot/types"
import { Text } from "../../components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { Maybe } from "utils/helpers"
import { useAccountStore } from "state/store"
import { useAssetAccountDetails, useAssetDetailsList } from "api/assetDetails"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { UseAssetModel } from "api/asset"

interface AssetsModalProps {
  allowedAssets?: Maybe<u32 | string>[]
  onSelect?: (asset: NonNullable<UseAssetModel>) => void
  onClose: () => void
  title?: string
  hideInactiveAssets?: boolean
  allAssets?: boolean
}

export const AssetsModal: FC<AssetsModalProps> = ({
  onClose,
  allowedAssets,
  onSelect,
  title,
  hideInactiveAssets,
  allAssets,
}) => {
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

  return (
    <>
      <ModalMeta
        withoutOutsideClose
        titleHeader={title ?? t("selectAsset.title")}
        secondaryIcon={{
          icon: <ChevronRight css={{ transform: "rotate(180deg)" }} />,
          name: "Back",
          onClick: onClose,
        }}
      />
      {!!mainAssets?.length && (
        <>
          <SAssetsModalHeader sx={{ m: ["0 -40px", "0 -40px"] }}>
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
          <SAssetsModalHeader shadowed sx={{ m: ["0 -40px", "0 -40px"] }}>
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
