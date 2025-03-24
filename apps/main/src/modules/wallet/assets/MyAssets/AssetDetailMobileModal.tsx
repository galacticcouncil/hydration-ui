import { Amount, Flex, ModalHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components"
import {
  AssetDetailMobileAction,
  AssetDetailMobileActions,
} from "@/modules/wallet/assets/MyAssets/AssetDetailMobileActions"
import {
  SAssetDetailMobileSeparator,
  SAssetDetailModalBody,
} from "@/modules/wallet/assets/MyAssets/AssetDetailMobileModal.styled"
import { AssetDetailMobileModalBalances } from "@/modules/wallet/assets/MyAssets/AssetDetailMobileModalBalances"
import { AssetDetailMobileModalBalancesHeader } from "@/modules/wallet/assets/MyAssets/AssetDetailMobileModalBalancesHeader"
import { AssetDetailStaking } from "@/modules/wallet/assets/MyAssets/AssetDetailStaking"
import { MyAsset } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"

type Props = {
  readonly asset: MyAsset
  readonly onActionOpen: (action: AssetDetailMobileAction) => void
}

export const AssetDetailMobileModal: FC<Props> = ({ asset, onActionOpen }) => {
  const { t } = useTranslation(["wallet", "common"])

  const [totalDisplayPrice] = useDisplayAssetPrice(asset.id, asset.total)

  return (
    <>
      <ModalHeader
        sx={{ p: 16 }}
        title={asset.symbol}
        description={asset.name}
      />
      <SAssetDetailModalBody>
        <Flex gap={16} direction="column">
          <Flex justify="space-between" align="center">
            <Amount
              label={t("myAssets.header.total")}
              value={t("common:number", {
                value: asset.total,
              })}
              displayValue={totalDisplayPrice}
            />
            <AssetDetailStaking asset={asset} />
          </Flex>
          <AssetDetailMobileActions onActionOpen={onActionOpen} />
          <div>
            <SAssetDetailMobileSeparator />
            <AssetDetailMobileModalBalancesHeader />
            <SAssetDetailMobileSeparator />
          </div>
          <AssetDetailMobileModalBalances assetId={asset.id} />
        </Flex>
      </SAssetDetailModalBody>
    </>
  )
}
