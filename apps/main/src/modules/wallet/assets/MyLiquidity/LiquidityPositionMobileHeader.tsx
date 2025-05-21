import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFull } from "@/components/AssetLabelFull"
import { LiquidityFarms } from "@/modules/wallet/assets/MyLiquidity/LiquidityFarms"
import { LiquidityPositionActions } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionActions"
import { SLiquidityPositionMobileHeader } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMobile.styled"
import { MyLiquidityPosition } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.data"
import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly asset: TAsset
  readonly position: MyLiquidityPosition
}

export const LiquidityPositionMobileHeader: FC<Props> = ({
  asset,
  position,
}) => {
  const { t } = useTranslation()
  return (
    <SLiquidityPositionMobileHeader>
      <AssetLabelFull asset={asset} withName={false} />
      <LiquidityFarms assetId={asset.id} rewards={position.rewards} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="tertiary" outline>
            {t("actions")}
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
    </SLiquidityPositionMobileHeader>
  )
}
