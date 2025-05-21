import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { LiquidityFarms } from "@/modules/wallet/assets/MyLiquidity/LiquidityFarms"
import { SLiquidityPosition } from "@/modules/wallet/assets/MyLiquidity/LiquidityPosition.styled"
import { LiquidityPositionActions } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionActions"
import { MyLiquidityPosition } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.data"
import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly asset: TAsset
  readonly number: number
  readonly position: MyLiquidityPosition
}

export const LiquidityPosition: FC<Props> = ({ asset, number, position }) => {
  const { t } = useTranslation(["wallet", "common"])

  const [initialDisplayPrice] = useDisplayAssetPrice(
    asset.id,
    position.initialValue,
  )
  const [currentDisplayPrice] = useDisplayAssetPrice(
    asset.id,
    position.currentValue,
  )

  return (
    <SLiquidityPosition>
      <Text fs="p4" fw={500} color={getToken("text.high")}>
        {position.isFarm
          ? t("myLiquidity.position.farmName", { number })
          : t("myLiquidity.position.name", { number })}
      </Text>
      <Amount
        label={t("common:initialValue")}
        value={t("common:currency", {
          value: position.initialValue,
          symbol: asset.symbol,
        })}
        displayValue={initialDisplayPrice}
      />
      <Amount
        label={t("common:currentValue")}
        value={t("common:currency", {
          value: position.currentValue,
          symbol: asset.symbol,
        })}
        displayValue={currentDisplayPrice}
      />
      <LiquidityFarms assetId={asset.id} rewards={position.rewards} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="tertiary" outline>
            {t("common:actions")}
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <LiquidityPositionActions
            assetId={asset.id}
            positionId={position.id}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </SLiquidityPosition>
  )
}
