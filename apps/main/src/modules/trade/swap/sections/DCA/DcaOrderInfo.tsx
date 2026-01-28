import { HealthFactorChange } from "@galacticcouncil/money-market/components"
import { TradeDcaOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import { Box, Summary } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { HealthFactorResult } from "@/api/aave"
import { SwapSummaryRow } from "@/modules/trade/swap/components/SwapSummaryRow"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

type Props = {
  readonly order: TradeDcaOrder | undefined
  readonly healthFactor: HealthFactorResult | undefined

  readonly isLoading: boolean
}

export const DcaOrderInfo: FC<Props> = ({ order, healthFactor, isLoading }) => {
  const { t } = useTranslation(["common", "trade"])

  if (isLoading || !order) {
    return null
  }

  return (
    <>
      <SwapSectionSeparator />
      <Box pb="xl">
        <Summary separator={<SwapSectionSeparator />}>
          {healthFactor?.isSignificantChange && (
            <SwapSummaryRow
              label={t("healthFactor")}
              content={
                <HealthFactorChange
                  healthFactor={healthFactor.current}
                  futureHealthFactor={healthFactor.future}
                />
              }
            />
          )}
        </Summary>
      </Box>
    </>
  )
}
