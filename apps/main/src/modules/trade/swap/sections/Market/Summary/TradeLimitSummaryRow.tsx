import { TriangleAlert } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  SummaryRowValue,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SwapSummaryRow } from "@/modules/trade/swap/components/SwapSummaryRow"
import { getMaxSlippageThreshold } from "@/modules/trade/swap/sections/Market/MarketWarnings"

type Props = {
  readonly tradeLimit: number
  readonly priceImpact: number
}

const WARING_TRADE_LIMIT = 3

export const TradeLimitSummaryRow: FC<Props> = ({
  tradeLimit,
  priceImpact,
}) => {
  const { t } = useTranslation(["common", "trade"])

  const absPriceImpact = Math.abs(priceImpact)
  const threshold = getMaxSlippageThreshold(absPriceImpact)
  const validSlippage = Big(absPriceImpact).plus(threshold).toNumber()

  const isWarning =
    tradeLimit > WARING_TRADE_LIMIT && tradeLimit > validSlippage

  return (
    <SwapSummaryRow
      label={t("trade:dca.summary.slippage")}
      content={
        <SummaryRowValue
          color={
            isWarning ? getToken("alarmRed.400") : getToken("text.tint.quart")
          }
        >
          <Flex align="start" gap="xs">
            {t("percent", { value: tradeLimit })}
            {isWarning && (
              <Tooltip
                text={t("trade:market.summary.tradeLimit.tooltip")}
                iconColor={getToken("accents.alertAlt.primary")}
                asChild
              >
                <Icon
                  size={14}
                  component={TriangleAlert}
                  color={getToken("accents.alertAlt.primary")}
                />
              </Tooltip>
            )}
          </Flex>
        </SummaryRowValue>
      }
    />
  )
}
