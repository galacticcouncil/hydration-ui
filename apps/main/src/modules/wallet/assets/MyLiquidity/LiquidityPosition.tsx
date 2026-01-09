import { Amount, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { useOmnipoolActiveFarm } from "@/api/farms"
import { AssetLogo } from "@/components/AssetLogo"
import { useDepositAprs } from "@/modules/liquidity/components/Farms/Farms.utils"
import { SLiquidityPosition } from "@/modules/wallet/assets/MyLiquidity/LiquidityPosition.styled"
import { LiquidityPositionActions } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionActions"
import { LiquidityPositionAction } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMoreActions"
import { AccountOmnipoolPosition } from "@/states/account"
import { useFormatOmnipoolPositionData } from "@/states/liquidity"

type Props = {
  readonly asset: TAssetData
  readonly number: number
  readonly position: AccountOmnipoolPosition
  readonly onAction: (
    action: LiquidityPositionAction.Remove | LiquidityPositionAction.Join,
  ) => void
}

export const LiquidityPosition: FC<Props> = ({
  asset,
  number,
  position,
  onAction,
}) => {
  const { t } = useTranslation(["wallet", "common"])
  const format = useFormatOmnipoolPositionData()
  const { data: activeFarms } = useOmnipoolActiveFarm(asset.id)
  const getDepositAprs = useDepositAprs()

  const { aprsByRewardAsset, joinedFarms, farmsToJoin } = getDepositAprs(
    position,
    activeFarms ?? [],
  )

  return (
    <SLiquidityPosition>
      <Text fs="p4" fw={500} color={getToken("text.high")}>
        {t("myLiquidity.position.name", { number })}
      </Text>

      <Amount
        label={t("common:initialValue")}
        value={t("common:currency", {
          value: position.data.initialValueHuman,
          symbol: position.data.meta.symbol,
        })}
        displayValue={t("common:currency", {
          value: position.data.initialDisplay,
        })}
      />

      <Amount
        label={t("common:currentValue")}
        value={format(position.data)}
        displayValue={t("common:currency", {
          value: position.data.currentTotalDisplay,
        })}
      />

      {joinedFarms.length ? (
        <Flex align="center" gap={getTokenPx("containers.paddings.quint")}>
          <AssetLogo
            id={joinedFarms.map(({ farm }) => farm.rewardCurrency.toString())}
          />
          <Text fs="p6" color={getToken("text.tint.secondary")}>
            {aprsByRewardAsset
              .map(({ apr }) => t("common:percent", { value: apr }))
              .join(" + ")}
          </Text>
        </Flex>
      ) : (
        <div />
      )}
      <LiquidityPositionActions
        position={position}
        farmsToJoin={farmsToJoin}
        onAction={onAction}
      />
    </SLiquidityPosition>
  )
}
