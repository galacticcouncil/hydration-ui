import {
  AssetPropertyChanged,
  AssetWarning,
  Flex,
  ModalContentDivider,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly assetId: string
}

export const InvalidAssetDataPreview: FC<Props> = ({ assetId }) => {
  const { t } = useTranslation("wallet")
  const { getAsset } = useAssets()

  const asset = getAsset(assetId)

  return (
    <Flex direction="column" gap="base" pb="base">
      <AssetWarning
        title={t("invalidAsset.modal.symbolChanged")}
        description={t("invalidAsset.modal.symbolChanged.description")}
        titleInfo={
          <AssetPropertyChanged
            previous={asset?.symbol}
            current={asset?.symbol}
          />
        }
      />
      <ModalContentDivider />
      <AssetWarning
        title={t("invalidAsset.modal.decimalsChanged")}
        description={t("invalidAsset.modal.decimalsChanged.description")}
        titleInfo={
          <AssetPropertyChanged
            previous={asset?.decimals}
            current={asset?.decimals}
          />
        }
      />
    </Flex>
  )
}
