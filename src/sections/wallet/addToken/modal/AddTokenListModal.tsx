import { useExternalAssetRegistry } from "api/externalAssetRegistry"
import PlusIcon from "assets/icons/PlusIcon.svg?react"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { ModalScrollableContent } from "components/Modal/Modal"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { SAssetsModalHeader } from "sections/assets/AssetsModal.styled"
import {
  SELECTABLE_PARACHAINS_IDS,
  TExternalAsset,
} from "sections/wallet/addToken/AddToken.utils"
import { AssetRow } from "sections/wallet/addToken/modal/AddTokenModal.styled"
import { SourceFilter } from "sections/wallet/addToken/modal/filter/SourceFilter"
import { AddTokenListSkeleton } from "sections/wallet/addToken/modal/skeleton/AddTokenListSkeleton"

const DEFAULT_PARACHAIN_ID = SELECTABLE_PARACHAINS_IDS[0]

type Props = {
  onAssetSelect?: (asset: TExternalAsset) => void
  onCustomAssetClick?: () => void
}

export const AddTokenListModal: React.FC<Props> = ({
  onAssetSelect,
  onCustomAssetClick,
}) => {
  const { t } = useTranslation()

  const [parachainId, setParachainId] = useState(DEFAULT_PARACHAIN_ID)

  const { data, isLoading } = useExternalAssetRegistry()
  const assets = data?.[parachainId] ?? []

  return (
    <>
      <SourceFilter value={parachainId} onChange={setParachainId} />
      <Spacer size={12} />
      <SAssetsModalHeader>
        <Text color="basic700" fw={500} fs={12} tTransform="uppercase">
          {t("wallet.addToken.header.availableAssets")}
        </Text>
      </SAssetsModalHeader>
      <ModalScrollableContent
        sx={{
          maxHeight: ["100%", 500],
          pr: 0,
          width: "100%",
        }}
        content={
          isLoading ? (
            <AddTokenListSkeleton />
          ) : (
            <div>
              {assets?.map((asset) => (
                <AssetRow key={asset.id} onClick={() => onAssetSelect?.(asset)}>
                  <Text fs={14} sx={{ flex: "row", align: "center", gap: 10 }}>
                    <Icon icon={<AssetLogo />} size={24} />
                    {asset.name}
                  </Text>
                </AssetRow>
              ))}
            </div>
          )
        }
        footer={
          <div sx={{ textAlign: "center", py: 20 }}>
            <Button size="micro" sx={{ py: 5 }} onClick={onCustomAssetClick}>
              <PlusIcon width={14} height={14} />
              {t("wallet.addToken.button.customAsset")}
            </Button>
          </div>
        }
      />
    </>
  )
}
