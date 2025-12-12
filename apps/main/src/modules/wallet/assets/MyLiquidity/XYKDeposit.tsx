import { Amount, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { useIsolatedPoolFarms } from "@/api/farms"
import { AssetLogo } from "@/components/AssetLogo"
import { useDepositAprs } from "@/modules/liquidity/components/Farms/Farms.utils"
import { SLiquidityPosition } from "@/modules/wallet/assets/MyLiquidity/LiquidityPosition.styled"
import { LiquidityPositionActions } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionActions"
import { toBig } from "@/utils/formatting"

import { XYKPosition } from "./MyLiquidityTable.data"

type Props = {
  readonly asset: TAssetData
  readonly number: number
  readonly position: XYKPosition
}

export const XYKDeposit: FC<Props> = ({ asset, number, position }) => {
  const { t } = useTranslation(["wallet", "common"])
  const { data: activeFarms } = useIsolatedPoolFarms(position.amm_pool_id)
  const getDepositAprs = useDepositAprs()

  const { aprsByRewardAsset, joinedFarms, farmsToJoin } = getDepositAprs(
    position,
    activeFarms ?? [],
  )

  const sharesHuman = toBig(position.shares, position.meta.decimals)

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
          value: Big(sharesHuman).times(position.price).toString(),
        })}
      />

      {joinedFarms.length ? (
        <Flex align="center" gap={getTokenPx("containers.paddings.quint")}>
          <AssetLogo
            id={joinedFarms.map(({ farm }) => farm.rewardCurrency.toString())}
          />
          <Text fs="p6" color={getToken("text.tint.secondary")}>
            {aprsByRewardAsset
              .map((apr) => t("common:percent", { value: apr.totalApr }))
              .join(" + ")}
          </Text>
        </Flex>
      ) : (
        <div />
      )}
      <LiquidityPositionActions
        assetId={asset.id}
        position={position}
        farmsToJoin={farmsToJoin}
      />
    </SLiquidityPosition>
  )
}
