import { Flex } from "@galacticcouncil/ui/components"
import { Amount } from "@galacticcouncil/ui/components"
import { bigShift } from "@galacticcouncil/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useFormatOmnipoolPositionData } from "@/states/liquidity"
import { toDecimal } from "@/utils/formatting"

import {
  isStableswapPosition,
  isXYKPosition,
  MyLiquidityPosition,
} from "./MyLiquidityTable.data"

type Props = {
  readonly position: MyLiquidityPosition
}

export const LiquidityPositionMobileValues: FC<Props> = ({ position }) => {
  const { t } = useTranslation("common")
  const format = useFormatOmnipoolPositionData()

  return (
    <Flex px="xxl" gap="xxxl">
      {isXYKPosition(position) ? (
        <Amount
          label={t("currentValue")}
          value={t("currency", {
            value: toDecimal(position.shares, position.meta.decimals),
            symbol: "Shares",
          })}
          displayValue={t("currency", {
            value: bigShift(position.shares.toString(), -position.meta.decimals)
              .times(position.price)
              .toString(),
          })}
        />
      ) : isStableswapPosition(position) ? (
        <Amount
          label={t("currentValue")}
          value={format(position.data)}
          displayValue={t("currency", {
            value: position.data.currentTotalDisplay,
          })}
        />
      ) : (
        <>
          <Amount
            label={t("initialValue")}
            value={t("currency", {
              value: position.data.initialValueHuman,
              symbol: position.data.meta.symbol,
            })}
            displayValue={t("currency", {
              value: position.data.initialDisplay,
            })}
          />

          <Amount
            label={t("currentValue")}
            value={format(position.data)}
            displayValue={t("currency", {
              value: position.data.currentTotalDisplay,
            })}
          />
        </>
      )}
    </Flex>
  )
}
