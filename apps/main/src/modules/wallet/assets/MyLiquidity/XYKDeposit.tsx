import { Amount, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { Farm } from "@/api/farms"
import { AssetLogo } from "@/components/AssetLogo"
import { useDepositAprs } from "@/modules/liquidity/components/Farms/Farms.utils"
import { SLiquidityPosition } from "@/modules/wallet/assets/MyLiquidity/LiquidityPosition.styled"
import { LiquidityPositionActions } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionActions"
import { LiquidityPositionAction } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionMoreActions"
import { toBig } from "@/utils/formatting"

import { XYKPositionDeposit } from "./MyIsolatedPoolsLiquidity.data"

type Props = {
  readonly number: number
  readonly position: XYKPositionDeposit
  readonly onAction: (
    action: LiquidityPositionAction.Remove | LiquidityPositionAction.Join,
  ) => void
  readonly farms: Farm[]
  readonly minJoinAmount?: string
}

export const XYKDeposit: FC<Props> = ({
  number,
  position,
  onAction,
  farms,
  minJoinAmount,
}) => {
  const { t } = useTranslation(["wallet", "common"])
  const getDepositAprs = useDepositAprs()

  const { aprsByRewardAsset, joinedFarms, farmsToJoin } = getDepositAprs(
    position,
    farms,
  )

  const sharesHuman = toBig(position.shares, position.meta.decimals)
  const canJoinFarms = Big(position.shares.toString()).gt(minJoinAmount ?? 0)

  return (
    <SLiquidityPosition>
      <Text fs="p4" fw={500} color={getToken("text.high")}>
        {t("myLiquidity.position.name", { number })}
      </Text>

      <Amount
        value={t("common:currency", {
          value: sharesHuman,
          symbol: "Shares",
        })}
        displayValue={t("common:currency", {
          value: sharesHuman.times(position.price).toString(),
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
        farmsToJoin={canJoinFarms ? farmsToJoin : []}
        onAction={onAction}
      />
    </SLiquidityPosition>
  )
}
