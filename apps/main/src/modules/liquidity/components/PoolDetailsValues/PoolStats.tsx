import { ChartLine, ChartPie } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  Paper,
  SliderTabs,
  SliderTabsOption,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useRef, useState } from "react"

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

export const chartTypes: ReadonlyArray<SliderTabsOption<"price" | "volume">> = [
  { id: "price", label: i18n.t("price") },
  //{ id: "volume", label: i18n.t("volume") },
]

export const types: ReadonlyArray<SliderTabsOption<"chart" | "stats">> = [
  {
    id: "chart",
    label: i18n.t("chart"),
    icon: <Icon size="s" component={ChartLine} />,
  },
  {
    id: "stats",
    label: i18n.t("stats"),
    icon: <Icon size="s" component={ChartPie} />,
  },
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
    <Flex gap="xl">
      <Paper
        p={["secondary", "primary"]}
        sx={{ flex: 1, flexBasis: "31.25rem" }}
      >
        <PoolChart
          assetId={data.id}
          height={isOmnipool && data.isStablepoolInOmnipool ? 500 : 420}
          interval={interval}
          setInterval={setInterval}
          isEmptyData={!isOmnipool}
        />
      </Paper>

      <Paper
        p={["secondary", "primary"]}
        sx={{
          flex: 0,
          flexBasis: "22.5rem",
        }}
      >
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
  const ref = useRef<HTMLDivElement>(null)
  //const [chartType, setChartType] = useState<"price" | "volume">("price")
  const [type, setType] = useState<"chart" | "stats">("chart")

  return (
    <Paper
      p={[16, 20]}
      sx={{ flex: 1, gap: "m", flexDirection: "column" }}
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
      <Flex gap="base" justify="space-between">
        <Flex align="center" gap="base">
          {/* TODO: Enable when new charts are added*/}
          {/* <SliderTabs
            options={chartTypes}
            selected={chartTypes.find((option) => option.id === chartType)?.id}
            onSelect={(option) => setChartType(option.id)}
            disabled={type === "stats"}
          /> */}
          <SliderTabs
            options={types}
            selected={types.find((option) => option.id === type)?.id}
            onSelect={(option) => {
              setType(option.id)
              ref.current?.scrollIntoView()
            }}
            ref={ref}
          />
        </Flex>
        {type === "chart" && (
          <ChartTimeRangeDropdown
            options={intervalOptions}
            selectedOption={interval}
            onSelect={(key) => setInterval(key)}
          />
        )}
      </Flex>
    </Paper>
  )
}
