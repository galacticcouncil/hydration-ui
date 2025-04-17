import { Amount, Flex, ModalHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components"
import { SAssetDetailMobileSeparator } from "@/modules/wallet/MyAssets/AssetDetailMobileModal.styled"
import { SAssetDetailModalBody } from "@/modules/wallet/MyAssets/AssetDetailMobileModal.styled"
import { LiquidityDetailMobileActions } from "@/modules/wallet/MyLiquidity/LiquidityDetailMobileActions"
import { LiquidityPositionMobile } from "@/modules/wallet/MyLiquidity/LiquidityPositionMobile"
import {
  WalletLiquidityCurrentValue,
  WalletLiquidityPosition,
} from "@/modules/wallet/MyLiquidity/MyLiquidityTable.columns"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly assetId: string
  readonly currentValue: WalletLiquidityCurrentValue
  readonly positions: ReadonlyArray<WalletLiquidityPosition>
}

export const LiquidityDetailMobileModal: FC<Props> = ({
  assetId,
  currentValue,
  positions,
}) => {
  const { t } = useTranslation(["wallet", "common"])
  const { getAsset } = useAssets()
  const asset = getAsset(assetId)

  const balance = 2855.24566
  const [balanceDisplayPrice] = useDisplayAssetPrice(assetId, balance)

  return (
    <>
      <ModalHeader
        sx={{ p: 16 }}
        title={asset?.symbol ?? ""}
        description={asset?.name}
      />
      <SAssetDetailModalBody>
        <Amount
          label={t("myLiquidity.header.currentValue")}
          value={t("common:number", {
            value: currentValue.balance,
          })}
          displayValue={balanceDisplayPrice}
        />
        <SAssetDetailMobileSeparator />
        <LiquidityDetailMobileActions />
        <SAssetDetailMobileSeparator />
        <Flex direction="column" gap={12}>
          {positions.map((position, index) => (
            <LiquidityPositionMobile
              key={index}
              assetId={assetId}
              position={position}
            />
          ))}
        </Flex>
      </SAssetDetailModalBody>
    </>
  )
}
