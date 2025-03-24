import { Amount, Flex } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components"
import { AssetDetailModalBody } from "@/modules/wallet/MyAssets/AssetDetailMobileModalBody.styled"
import { AssetDetailMobileSeparator } from "@/modules/wallet/MyAssets/AssetDetailMobileModalBody.styled"
import { LiquidityDetailMobileActions } from "@/modules/wallet/MyLiquidity/LiquidityDetailMobileActions"
import { LiquidityPositionMobile } from "@/modules/wallet/MyLiquidity/LiquidityPositionMobile"
import {
  WalletLiquidityCurrentValue,
  WalletLiquidityPosition,
} from "@/modules/wallet/MyLiquidity/MyLiquidityTable.columns"

type Props = {
  readonly assetId: string
  readonly currentValue: WalletLiquidityCurrentValue
  readonly positions: ReadonlyArray<WalletLiquidityPosition>
}

export const LiquidityDetailMobileModalBody: FC<Props> = ({
  assetId,
  currentValue,
  positions,
}) => {
  const { t } = useTranslation(["wallet", "common"])

  const balance = 2855.24566
  const [balanceDisplayPrice] = useDisplayAssetPrice(assetId, balance)

  return (
    <AssetDetailModalBody>
      <Flex gap={16} direction="column">
        <Amount
          label={t("myLiquidity.header.currentValue")}
          value={currentValue.balance}
          displayValue={balanceDisplayPrice}
        />
        <AssetDetailMobileSeparator />
        <LiquidityDetailMobileActions />
        <AssetDetailMobileSeparator />
        <Flex direction="column" gap={12}>
          {positions.map((position, index) => (
            <LiquidityPositionMobile
              key={index}
              assetId={assetId}
              position={position}
            />
          ))}
        </Flex>
      </Flex>
    </AssetDetailModalBody>
  )
}
