import { HealthFactorChange } from "@galacticcouncil/money-market/components"
import { TradeDcaOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import {
  Flex,
  Summary,
  SummaryRow,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { formatDistanceToNowStrict } from "date-fns"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { HealthFactorResult } from "@/api/aave"
import { getPeriodDuration } from "@/components/PeriodInput/PeriodInput.utils"
import { DcaSummarySkeleton } from "@/modules/trade/swap/sections/DCA/DcaSummarySkeleton"
import { DcaFormValues } from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useTradeSettings } from "@/states/tradeSettings"

type Props = {
  readonly order: TradeDcaOrder | undefined
  readonly healthFactor: HealthFactorResult | undefined
  readonly isLoading: boolean
}

export const DcaSummary: FC<Props> = ({ order, healthFactor, isLoading }) => {
  const { t } = useTranslation(["common", "trade"])
  const { formState, watch } = useFormContext<DcaFormValues>()

  const [sellAmount, sellAsset, buyAsset, period] = watch([
    "sellAmount",
    "sellAsset",
    "buyAsset",
    "period",
  ])

  const {
    dca: { slippage },
  } = useTradeSettings()

  if (isLoading) {
    return <DcaSummarySkeleton />
  }

  if (
    !sellAsset ||
    !buyAsset ||
    !period ||
    !sellAmount ||
    !order ||
    !formState.isValid
  ) {
    return null
  }

  const now = Date.now()
  const duration = getPeriodDuration(period)

  return (
    <div>
      <Flex direction="column" gap={8} py={8}>
        <Text fw={500} fs={14} lh={px(22)} color={getToken("text.medium")}>
          {t("summary")}
        </Text>
        <Flex gap={5}>
          <Text fw={500} fs="p3" lh={1} color={getToken("text.high")}>
            {t("trade:dca.summary.description", {
              sellAmount: t("number", { value: sellAmount }),
              sellSymbol: sellAsset.symbol,
              buySymbol: buyAsset.symbol,
              timeframe: formatDistanceToNowStrict(now + order.frequency),
              period: t(period.type, { count: period.value ?? 0 }),
            })}
          </Text>
          <Tooltip text="TODO" />
        </Flex>
      </Flex>
      <SwapSectionSeparator sx={{ mt: 9 }} />
      <Summary separator={<SwapSectionSeparator />}>
        <SummaryRow
          label={t("trade:dca.summary.scheduleEnd")}
          content={t("date.datetime", { value: new Date(now + duration) })}
        />
        <SummaryRow
          label={t("trade:dca.summary.slippage")}
          content={t("percent", { value: slippage })}
        />
        {healthFactor && (
          <SummaryRow
            label={t("trade:market.summary.healthFactor")}
            content={
              <HealthFactorChange
                healthFactor={healthFactor.current}
                futureHealthFactor={healthFactor.future}
              />
            }
          />
        )}
      </Summary>
    </div>
  )
}
