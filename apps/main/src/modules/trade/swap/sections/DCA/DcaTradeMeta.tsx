import { HealthFactorChange } from "@galacticcouncil/money-market/components"
import { HealthFactorResult } from "@galacticcouncil/money-market/utils"
import { TradeDcaOrder } from "@galacticcouncil/sdk-next/sor"
import {
  ExclamationMark,
  TriangleAlert,
} from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  Summary,
  SummaryRowValue,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SwapSummaryRow } from "@/modules/trade/swap/components/SwapSummaryRow"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useTradeSettings } from "@/states/tradeSettings"

type Props = {
  readonly order: TradeDcaOrder
  readonly healthFactor: HealthFactorResult | undefined
  readonly priceImpactLevel: "error" | "warning" | undefined
}

export const DcaTradeMeta: FC<Props> = ({
  order,
  healthFactor,
  priceImpactLevel,
}) => {
  const { t } = useTranslation(["common", "trade"])
  const {
    swap: {
      split: { twapSlippage },
    },
  } = useTradeSettings()

  return (
    <Summary
      sx={{ width: "100%" }}
      separator={<SwapSectionSeparator />}
      withTrailingSeparator
    >
      {healthFactor?.isSignificantChange && (
        <SwapSummaryRow
          label={t("healthFactor")}
          content={<HealthFactorChange {...healthFactor} />}
        />
      )}
      <SwapSummaryRow
        label={t("trade:dca.summary.slippage")}
        content={
          <SummaryRowValue color={getToken("text.tint.quart")}>
            {t("percent", { value: twapSlippage })}
          </SummaryRowValue>
        }
      />
      <SwapSummaryRow
        label={t("trade:dca.summary.priceImpact")}
        content={
          <SummaryRowValue
            as="div"
            color={(() => {
              switch (priceImpactLevel) {
                case "error":
                  return getToken("accents.danger.secondary")
                case "warning":
                  return getToken("accents.alertAlt.primary")
                default:
                  return undefined
              }
            })()}
          >
            <Flex align="center" gap="s">
              {t("percent", { value: order.tradeImpactPct })}
              {(() => {
                switch (priceImpactLevel) {
                  case "error":
                    return <Icon size="s" component={ExclamationMark} />
                  case "warning":
                    return <Icon size="s" component={TriangleAlert} />
                  default:
                    return null
                }
              })()}
            </Flex>
          </SummaryRowValue>
        }
      />
    </Summary>
  )
}
