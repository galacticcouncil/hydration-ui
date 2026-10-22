import { Amount, Flex, ModalHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFull } from "@/components/AssetLabelFull"
import { AssetDetailMobileActions } from "@/modules/portfolio/overview/MyAssets/AssetDetailMobileActions"
import { AssetDetailMobileModalBalances } from "@/modules/portfolio/overview/MyAssets/AssetDetailMobileModalBalances"
import { AssetDetailMobileModalBalancesHeader } from "@/modules/portfolio/overview/MyAssets/AssetDetailMobileModalBalancesHeader"
import {
  SAssetDetailMobileSeparator,
  SAssetDetailModalBody,
} from "@/modules/portfolio/overview/MyAssets/AssetDetailNativeMobileModal.styled"
import { AssetDetailTotal } from "@/modules/portfolio/overview/MyAssets/AssetDetailTotal"
import { AssetOrigin } from "@/modules/portfolio/overview/MyAssets/AssetOrigin"
import {
  AssetDetailModal,
  MyAsset,
} from "@/modules/portfolio/overview/MyAssets/MyAssetsTable.columns"

type Props = {
  readonly asset: MyAsset
  readonly onModalOpen?: (action: AssetDetailModal) => void
  readonly isReadOnly?: boolean
  readonly showDepositAction?: boolean
}

export const AssetDetailMobileModal: FC<Props> = ({
  asset,
  onModalOpen,
  isReadOnly = false,
  showDepositAction = true,
}) => {
  const { t } = useTranslation(["wallet", "common"])

  return (
    <>
      <ModalHeader
        title={asset.symbol}
        customTitle={<AssetLabelFull asset={asset} size="primary" />}
      />
      <SAssetDetailModalBody>
        <Flex direction="column" gap="base">
          <AssetDetailTotal assetId={asset.id} total={asset.total} />
        </Flex>
        {asset.origin?.name && (
          <>
            <SAssetDetailMobileSeparator />
            <AssetOrigin origin={asset.origin} />
          </>
        )}
        {isReadOnly ? (
          <>
            <SAssetDetailMobileSeparator />
            <Amount
              variant="horizontalLabel"
              label={t("myAssets.header.transferable")}
              value={t("common:number", {
                value: asset.transferable,
              })}
              displayValue={
                asset.transferableDisplay
                  ? t("common:currency", {
                      value: asset.transferableDisplay,
                    })
                  : "-"
              }
            />
          </>
        ) : (
          <>
            <div>
              <SAssetDetailMobileSeparator />
              <AssetDetailMobileModalBalancesHeader />
              <SAssetDetailMobileSeparator />
            </div>

            <AssetDetailMobileModalBalances asset={asset} />
          </>
        )}
        <AssetDetailMobileActions
          asset={asset}
          onModalOpen={onModalOpen}
          isReadOnly={isReadOnly}
          showDepositAction={showDepositAction}
        />
      </SAssetDetailModalBody>
    </>
  )
}
