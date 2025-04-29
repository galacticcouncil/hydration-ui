import { AreaChart, Flex, ValueStats } from "@galacticcouncil/ui/components"
import { MOCK_TIME_DATA } from "@galacticcouncil/ui/components/Chart/utils"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { last } from "remeda"

import { useDisplayAssetPrice } from "@/components"
import { ChartState } from "@/components/ChartState"

// TODO wallet net worth
export const NetWorth: FC = () => {
  const { t } = useTranslation(["wallet", "common"])

  const [crosshair, setCrosshair] = useState<
    (typeof MOCK_TIME_DATA)[number] | null
  >(null)

  const lastDataPoint = last(MOCK_TIME_DATA)
  const value = crosshair?.value ?? lastDataPoint?.value ?? 0

  const [netWorth] = useDisplayAssetPrice("10", value)

  // mock fetch status for now
  const isSuccess = false
  const isError = false
  const isLoading = false
  const isEmpty = false

  return (
    <Flex
      direction={["row", "column"]}
      align={["center", "flex-start"]}
      pb={[8, 0]}
    >
      <ValueStats
        alwaysWrap
        size="medium"
        label={t("balances.header.netWorth")}
        value={netWorth}
      />
      <Flex
        align="center"
        justify="center"
        sx={{ textAlign: "center" }}
        height="100%"
        width="100%"
      >
        <ChartState
          isSuccess={isSuccess}
          isError={isError}
          isLoading={isLoading}
          isEmpty={isEmpty}
        >
          <AreaChart
            data={MOCK_TIME_DATA}
            xAxisHidden
            yAxisHidden
            verticalGridHidden
            curveType="linear"
            onCrosshairMove={setCrosshair}
            config={{
              xAxisKey: "timestamp",
              xAxisType: "time",
              yAxisFormatter: (value) => t("common:currency", { value }),
              tooltipType: "timeBottom",
              series: [
                {
                  label: t("balances.header.netWorth"),
                  key: "value",
                },
              ],
            }}
          />
        </ChartState>
      </Flex>
    </Flex>
  )
}
