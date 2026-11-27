import {
  ExclamationMark,
  TriangleAlert,
} from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  Skeleton,
  Summary,
  SummaryRowValue,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { HealthFactorResult } from "@/api/aave"
import { HealthFactorChange } from "@/modules/money-market/actions/HealthFactorChange"
import { SwapSummaryRow } from "@/modules/trade/swap/components/SwapSummaryRow"
import { TradeLimitSummaryRow } from "@/modules/trade/swap/sections/XcSwap/components/Summary/TradeLimitSummaryRow"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useTradeSettings } from "@/states/tradeSettings"

type Props = {
  readonly priceImpactPct: number | undefined
  readonly healthFactor: HealthFactorResult | undefined
  readonly priceImpactLevel: "error" | "warning" | undefined
}

export const DcaTradeMeta: FC<Props> = ({
  priceImpactPct,
  healthFactor,
  priceImpactLevel,
}) => {
  const { t } = useTranslation(["common", "trade"])
  const {
    dca: { slippage: twapSlippage },
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
          content={
            <HealthFactorChange
              current={healthFactor.current}
              projected={healthFactor.future}
            />
          }
        />
      )}
      <TradeLimitSummaryRow
        tradeLimit={twapSlippage}
        priceImpact={priceImpactPct ?? 0}
        settingsSection="split"
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
              {priceImpactPct !== undefined ? (
                t("percent", { value: priceImpactPct })
              ) : (
                <Skeleton sx={{ width: "3xl" }} height="1em" />
              )}
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
