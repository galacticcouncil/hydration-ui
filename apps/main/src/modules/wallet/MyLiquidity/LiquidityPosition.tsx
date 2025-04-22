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

import { useDisplayAssetPrice } from "@/components"
import { LiquidityFarms } from "@/modules/wallet/MyLiquidity/LiquidityFarms"
import { SLiquidityPosition } from "@/modules/wallet/MyLiquidity/LiquidityPosition.styled"
import { LiquidityPositionActions } from "@/modules/wallet/MyLiquidity/LiquidityPositionActions"
import { WalletLiquidityPosition } from "@/modules/wallet/MyLiquidity/MyLiquidityTable.columns"

type Props = {
  readonly assetId: string
  readonly number: number
  readonly position: WalletLiquidityPosition
}

export const LiquidityPosition: FC<Props> = ({ assetId, number, position }) => {
  const { t } = useTranslation()

  const [initialDisplayPrice] = useDisplayAssetPrice(
    assetId,
    position.initialValue,
  )
  const [currentDisplayPrice] = useDisplayAssetPrice(
    assetId,
    position.currentValue,
  )

  return (
    <SLiquidityPosition>
      <Text fs="p4" fw={500} color={getToken("text.high")}>
        #{number} {position.name}
      </Text>
      <Amount
        label={t("initialValue")}
        value={t("number", {
          value: position.initialValue,
        })}
        displayValue={initialDisplayPrice}
      />
      <Amount
        label={t("currentValue")}
        value={t("number", {
          value: position.currentValue,
        })}
        displayValue={currentDisplayPrice}
      />
      <LiquidityFarms assetId={assetId} rewards={position.rewards} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="tertiary" outline iconEnd={ChevronDown}>
            {t("actions")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <LiquidityPositionActions />
        </DropdownMenuContent>
      </DropdownMenu>
    </SLiquidityPosition>
  )
}
