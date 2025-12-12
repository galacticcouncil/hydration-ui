import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Flex,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useOmnipoolActiveFarm } from "@/api/farms"
import { AssetLabelFull, AssetLabelXYK } from "@/components/AssetLabelFull"
import { AssetLogo } from "@/components/AssetLogo"
import { useDepositAprs } from "@/modules/liquidity/components/Farms/Farms.utils"
import { SLiquidityPositionMobileHeader } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMobile.styled"
import { LiquidityPositionMoreActions } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMoreActions"
import { isShareToken, TAsset } from "@/providers/assetsProvider"
import { AccountOmnipoolPosition } from "@/states/account"

import { XYKPosition } from "./MyLiquidityTable.data"

type Props = {
  readonly asset: TAsset
  readonly position: AccountOmnipoolPosition | XYKPosition
}

export const LiquidityPositionMobileHeader: FC<Props> = ({
  asset,
  position,
}) => {
  const { t } = useTranslation("common")
  const { data: activeFarms } = useOmnipoolActiveFarm(asset.id)
  const getDepositAprs = useDepositAprs()

  const { aprsByRewardAsset, joinedFarms, farmsToJoin } = getDepositAprs(
    position,
    activeFarms ?? [],
  )

  return (
    <SLiquidityPositionMobileHeader>
      {isShareToken(asset) ? (
        <AssetLabelXYK iconIds={asset.iconId} symbol={asset.symbol} />
      ) : (
        <AssetLabelFull asset={asset} withName={false} />
      )}
      {joinedFarms.length ? (
        <Flex align="center" gap={getTokenPx("containers.paddings.quint")}>
          <AssetLogo
            id={joinedFarms.map(({ farm }) => farm.rewardCurrency.toString())}
          />
          <Text fs="p6" color={getToken("text.tint.secondary")}>
            {aprsByRewardAsset
              .map((apr) => t("percent", { value: apr.totalApr }))
              .join(" + ")}
          </Text>
        </Flex>
      ) : (
        <div />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="tertiary" outline>
            {t("actions")}
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <LiquidityPositionMoreActions
            assetId={asset.id}
            position={position}
            farmsToJoin={farmsToJoin}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </SLiquidityPositionMobileHeader>
  )
}
