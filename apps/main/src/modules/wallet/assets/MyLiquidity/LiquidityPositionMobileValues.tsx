import { Flex } from "@galacticcouncil/ui/components"
import { Amount } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components"
import { MyLiquidityPosition } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.data"
import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly asset: TAsset
  readonly position: MyLiquidityPosition
}

export const LiquidityPositionMobileValues: FC<Props> = ({
  asset,
  position,
}) => {
  const { t } = useTranslation()

  const [initialValueDisplayPrice] = useDisplayAssetPrice(
    asset.id,
    position.initialValue,
  )

  const [currentValueDisplayPrice] = useDisplayAssetPrice(
    asset.id,
    position.currentValue,
  )

  return (
    <Flex px={getTokenPx("containers.paddings.primary")} gap={54}>
      <Amount
        label={t("initialValue")}
        value={t("currency", {
          value: position.initialValue,
          symbol: asset.symbol,
        })}
        displayValue={initialValueDisplayPrice}
      />
      <Amount
        label={t("currentValue")}
        value={t("currency", {
          value: position.currentValue,
          symbol: asset.symbol,
        })}
        displayValue={currentValueDisplayPrice}
      />
    </Flex>
  )
}
