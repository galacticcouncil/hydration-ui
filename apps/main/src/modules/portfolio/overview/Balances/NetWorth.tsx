import {
  AnimatedValue,
  SValueStatsValue,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { USDT_ASSET_ID } from "@galacticcouncil/utils"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"

type Props = {
  readonly assetBalance: string
  readonly liquidityBalance: string
  readonly borrowed: string
  readonly isCurrentLoading: boolean
}

export const NetWorth: FC<Props> = ({
  assetBalance,
  liquidityBalance,
  borrowed,
  isCurrentLoading,
}) => {
  const currentNetWorth = Big(assetBalance || "0")
    .plus(liquidityBalance || "0")
    .minus(borrowed || "0")
    .toString()

  return (
    <NetWorthValue
      value={Number(currentNetWorth)}
      isLoading={isCurrentLoading}
    />
  )
}

const NetWorthValue = ({
  value,
  isLoading,
}: {
  value: number
  isLoading: boolean
}) => {
  const { t } = useTranslation(["wallet", "common"])
  const [_, { price }] = useDisplayAssetPrice(USDT_ASSET_ID, value)

  return (
    <ValueStats
      wrap={[false, false, true]}
      size="medium"
      label={t("balances.header.netWorth")}
      isLoading={isLoading}
      customValue={
        <SValueStatsValue size="medium">
          <AnimatedValue
            value={Number(price)}
            format={(value) => t("common:currency", { value })}
          />
        </SValueStatsValue>
      }
    />
  )
}
