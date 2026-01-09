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

import { TAssetData } from "@/api/assets"
import { useIsolatedPoolFarms, useOmnipoolActiveFarm } from "@/api/farms"
import { AssetLabelFull, AssetLabelXYK } from "@/components/AssetLabelFull"
import { AssetLogo } from "@/components/AssetLogo"
import { useDepositAprs } from "@/modules/liquidity/components/Farms/Farms.utils"
import { SLiquidityPositionMobileHeader } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMobile.styled"
import {
  LiquidityPositionAction,
  LiquidityPositionMoreActions,
  StableswapPositionMoreActions,
  XYKSharesPositionMoreActions,
} from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMoreActions"
import { TShareToken } from "@/providers/assetsProvider"
import { AccountOmnipoolPosition } from "@/states/account"

import {
  isXYKPositionDeposit,
  XYKPosition,
} from "./MyIsolatedPoolsLiquidity.data"
import {
  isStableswapPosition,
  StableswapPosition,
} from "./MyLiquidityTable.data"

type Props = {
  readonly asset: TAssetData
  readonly position: AccountOmnipoolPosition | StableswapPosition
  readonly onLiquidityAction: (
    action: LiquidityPositionAction.Remove | LiquidityPositionAction.Join,
    position: AccountOmnipoolPosition,
  ) => void
  readonly onStableSwapAction: (
    action: LiquidityPositionAction.Remove | LiquidityPositionAction.Add,
    position: StableswapPosition,
  ) => void
}

export const LiquidityPositionMobileHeader: FC<Props> = ({
  asset,
  position,
  onLiquidityAction,
  onStableSwapAction,
}) => {
  const { t } = useTranslation("common")
  const { data: activeFarms } = useOmnipoolActiveFarm(asset.id)
  const getDepositAprs = useDepositAprs()

  const isStableswap = isStableswapPosition(position)
  const { aprsByRewardAsset, joinedFarms, farmsToJoin } = !isStableswap
    ? getDepositAprs(position, activeFarms ?? [])
    : { aprsByRewardAsset: [], joinedFarms: [], farmsToJoin: [] }

  return (
    <SLiquidityPositionMobileHeader>
      <AssetLabelFull asset={asset} withName={false} />
      {joinedFarms.length ? (
        <Flex align="center" gap={getTokenPx("containers.paddings.quint")}>
          <AssetLogo
            id={joinedFarms.map(({ farm }) => farm.rewardCurrency.toString())}
          />
          <Text fs="p6" color={getToken("text.tint.secondary")}>
            {aprsByRewardAsset
              .map(({ apr }) => t("percent", { value: apr }))
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
          {isStableswap ? (
            <StableswapPositionMoreActions
              onAction={(action) => onStableSwapAction(action, position)}
            />
          ) : (
            <LiquidityPositionMoreActions
              position={position}
              farmsToJoin={farmsToJoin}
              onAction={(action) => onLiquidityAction(action, position)}
            />
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </SLiquidityPositionMobileHeader>
  )
}

export const XYKLiquidityPositionMobileHeader = ({
  asset,
  position,
  onAction,
}: {
  readonly asset: TShareToken
  readonly position: XYKPosition
  readonly onAction: (
    action: LiquidityPositionAction.Remove | LiquidityPositionAction.Join,
  ) => void
}) => {
  const { t } = useTranslation("common")
  const { data: activeFarms } = useIsolatedPoolFarms(asset.id)
  const getDepositAprs = useDepositAprs()

  const isDepositPosition = isXYKPositionDeposit(position)
  const { aprsByRewardAsset, joinedFarms, farmsToJoin } = isDepositPosition
    ? getDepositAprs(position, activeFarms ?? [])
    : { aprsByRewardAsset: [], joinedFarms: [], farmsToJoin: [] }

  return (
    <SLiquidityPositionMobileHeader>
      <AssetLabelXYK iconIds={asset.iconId} symbol={asset.symbol} />
      {joinedFarms.length ? (
        <Flex align="center" gap={getTokenPx("containers.paddings.quint")}>
          <AssetLogo
            id={joinedFarms.map(({ farm }) => farm.rewardCurrency.toString())}
          />
          <Text fs="p6" color={getToken("text.tint.secondary")}>
            {aprsByRewardAsset
              .map(({ apr }) => t("percent", { value: apr }))
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
          {!isDepositPosition ? (
            <XYKSharesPositionMoreActions
              farmsToJoin={farmsToJoin}
              onAction={onAction}
            />
          ) : (
            <LiquidityPositionMoreActions
              position={position}
              farmsToJoin={farmsToJoin}
              onAction={onAction}
            />
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </SLiquidityPositionMobileHeader>
  )
}
