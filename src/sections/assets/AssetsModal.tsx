import { Modal } from "../../components/Modal/Modal"
import { FC } from "react"
import { useAssets } from "../../api/asset"
import { AssetsModalRow } from "./AssetsModalRow"
import { SAssetsModalHeader } from "./AssetsModal.styled"
import { Maybe } from "../../utils/types"
import { u32 } from "@polkadot/types"
import { Text } from "../../components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

interface AssetsModalProps {
  allowedAssets?: Maybe<u32 | string>[]
  onSelect?: (id: u32 | string) => void
  onClose: () => void
}

export const AssetsModal: FC<AssetsModalProps> = ({
  onClose,
  allowedAssets,
  onSelect,
}) => {
  const { t } = useTranslation()
  const assetsRows = useAssets()

  const mainAssets = assetsRows.data?.filter((asset) =>
    allowedAssets?.includes(asset.id),
  )
  const otherAssets = assetsRows.data?.filter(
    (asset) => !allowedAssets?.includes(asset.id),
  )

  return (
    <Modal open={true} onClose={onClose}>
      {!!mainAssets?.length && (
        <>
          <SAssetsModalHeader>
            <Text
              color="neutralGray300"
              fw={500}
              fs={12}
              tTransform="uppercase"
            >
              {t("selectAssets.asset")}
            </Text>
            <Text
              color="neutralGray300"
              fw={500}
              fs={12}
              tTransform="uppercase"
            >
              {t("selectAssets.your_balance")}
            </Text>
          </SAssetsModalHeader>
          {mainAssets?.map((asset) => (
            <AssetsModalRow
              id={asset.id}
              onClick={() => onSelect?.(asset.id)}
            />
          ))}
        </>
      )}
      {!!otherAssets?.length && (
        <>
          <SAssetsModalHeader shadowed>
            <Text
              color="neutralGray300"
              fw={500}
              fs={12}
              tTransform="uppercase"
            >
              {t("selectAssets.asset_without_pair")}
            </Text>
          </SAssetsModalHeader>
          {otherAssets?.map((asset) => (
            <AssetsModalRow
              id={asset.id}
              onClick={() => onSelect?.(asset.id)}
            />
          ))}
        </>
      )}
    </Modal>
  )
}
