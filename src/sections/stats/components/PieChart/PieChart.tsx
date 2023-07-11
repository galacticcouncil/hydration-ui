import { ComponentProps } from "react"
import { ASSET_COLORS } from "./PieChart.utils"
import {
  SliceLabelRest,
  TLabelRest,
} from "./components/SliceLabelRest/SliceLabelRest"
import { SliceLabel } from "./components/SliceLabel/SliceLabel"
import { PieSkeleton } from "./components/Skeleton/Skeleton"
import { t } from "i18next"
import { TOmnipoolOverviewData } from "sections/stats/sections/overview/data/OmnipoolOverview.utils"
import { BN_0 } from "utils/constants"
import { DoughnutChart } from "../DoughnutChart/DoughnutChart"
import { EmotionJSX } from "@emotion/react/types/jsx-namespace"

type TSlice = {
  percentage: number
  color: string
  label: EmotionJSX.Element
  symbol: string
  name: string
  assets?: TLabelRest[]
}

type PieChartProps = {
  data: TOmnipoolOverviewData
  label?: ComponentProps<typeof DoughnutChart>["label"]
}

export const PieChart = ({ data, label }: PieChartProps) => {
  if (!data) return <PieSkeleton />

  const tvlTotal = data.reduce(
    (acc, omnipoolAsset) => omnipoolAsset.tvl.plus(acc),
    BN_0,
  )

  const slices = data
    ?.reduce<TSlice[]>((acc, omnipoolAsset) => {
      const percentage = Number(
        omnipoolAsset.tvl.div(tvlTotal).multipliedBy(100).toFixed(2),
      )

      if (percentage > 1) {
        const label = (
          <SliceLabel
            key={percentage}
            symbol={omnipoolAsset.symbol}
            tvl={omnipoolAsset.tvl}
            percentage={percentage}
          />
        )

        acc.push({
          percentage,
          color: ASSET_COLORS[omnipoolAsset.symbol.toLowerCase()] ?? "#ffffff",
          label,
          symbol: omnipoolAsset.symbol,
          name: omnipoolAsset.name,
        })
      } else {
        const restAssets = acc.find((slice) => slice.symbol === "rest")

        if (restAssets) {
          const assets = [
            ...(restAssets.assets ?? []),
            {
              name: omnipoolAsset.name,
              percentage,
              tvl: omnipoolAsset.tvl,
            },
          ]

          const label = <SliceLabelRest key={percentage} assets={assets} />

          return acc.map((slice) =>
            slice.symbol === "rest"
              ? {
                  ...slice,
                  percentage: (slice.percentage += percentage),
                  label,
                  assets,
                }
              : slice,
          )
        } else {
          const assets = [
            {
              name: omnipoolAsset.name,
              percentage,
              tvl: omnipoolAsset.tvl,
            },
          ]
          const label = <SliceLabelRest key={percentage} assets={assets} />

          acc.push({
            percentage,
            color: "#D9D9D9",
            label,
            symbol: "rest",
            assets,
            name: t("stats.overview.pie.rest.header.assets"),
          })
        }
      }

      return acc
    }, [])
    .sort((a) => (a.symbol !== "rest" ? -1 : 0))

  return <DoughnutChart slices={slices} label={label} />
}
