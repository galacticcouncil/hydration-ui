import { ChartLine, ChartPie } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  Paper,
  SliderTabs,
  SliderTabsOption,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useState } from "react"

import { ChartTimeRangeDropdown } from "@/components/ChartTimeRange/ChartTimeRangeDropdown"
import i18n from "@/i18n"
import {
  intervalOptions,
  PoolChart,
  PoolChartTimeFrameType,
} from "@/modules/liquidity/components/PoolDetailsChart/PoolDetailsChart"
import {
  isIsolatedPool,
  IsolatedPoolTable,
  OmnipoolAssetTable,
} from "@/modules/liquidity/Liquidity.utils"

import { PoolDetailsValues } from "./PoolDetailsValues"

const chartTypes: ReadonlyArray<SliderTabsOption<"price" | "volume">> = [
  { id: "price", label: i18n.t("price") },
  //{ id: "volume", label: i18n.t("volume") },
]

const types: ReadonlyArray<SliderTabsOption<"chart" | "stats">> = [
  { id: "chart", label: "", icon: <Icon size={14} component={ChartLine} /> },
  { id: "stats", label: "", icon: <Icon size={14} component={ChartPie} /> },
]

export const PoolStats = ({
  data,
}: {
  data: OmnipoolAssetTable | IsolatedPoolTable
}) => {
  const { isTablet, isMobile } = useBreakpoints()
  const isOmnipool = !isIsolatedPool(data)
  const [interval, setInterval] = useState<PoolChartTimeFrameType | "all">(
    "all",
  )

  if (isTablet || isMobile) {
    return (
      <PoolStatsMobile
        data={data}
        interval={interval}
        setInterval={setInterval}
        isEmptyData={!isOmnipool}
      />
    )
  }

  return (
    <Flex gap={20}>
      <Paper p={[16, 20]} sx={{ flex: 1 }}>
        <PoolChart
          assetId={data.id}
          height={isOmnipool && data.isStablepoolInOmnipool ? 500 : 420}
          interval={interval}
          setInterval={setInterval}
          isEmptyData={!isOmnipool}
        />
      </Paper>

      <Paper p={[16, 20]}>
        <PoolDetailsValues data={data} />
      </Paper>
    </Flex>
  )
}

const PoolStatsMobile = ({
  data,
  interval,
  setInterval,
  isEmptyData = false,
}: {
  data: OmnipoolAssetTable | IsolatedPoolTable
  interval: PoolChartTimeFrameType | "all"
  setInterval: (interval: PoolChartTimeFrameType | "all") => void
  isEmptyData?: boolean
}) => {
  const [chartType, setChartType] = useState<"price" | "volume">("price")
  const [type, setType] = useState<"chart" | "stats">("chart")

  return (
    <Paper
      p={[16, 20]}
      sx={{ flex: 1, gap: 12, flexDirection: "column" }}
      as={Flex}
    >
      {type === "chart" ? (
        <PoolChart
          assetId={data.id}
          height={350}
          interval={interval}
          setInterval={setInterval}
          isEmptyData={isEmptyData}
        />
      ) : (
        <PoolDetailsValues data={data} />
      )}
      <Flex gap={8} justify="space-between">
        <Flex align="center" gap={getTokenPx("containers.paddings.quart")}>
          <SliderTabs
            options={chartTypes}
            selected={chartTypes.find((option) => option.id === chartType)?.id}
            onSelect={(option) => setChartType(option.id)}
            disabled={type === "stats"}
          />
          <SliderTabs
            options={types}
            selected={types.find((option) => option.id === type)?.id}
            onSelect={(option) => setType(option.id)}
          />
        </Flex>
        <ChartTimeRangeDropdown
          options={intervalOptions}
          selectedOption={interval}
          onSelect={(key) => setInterval(key)}
          disabled={type === "stats"}
        />
      </Flex>
    </Paper>
  )
}
