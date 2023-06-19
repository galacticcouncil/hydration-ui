import { Fragment, useMemo, useState } from "react"
import { SClipPath, SLabelContainer, SSliceContainer } from "./PieChart.styled"
import {
  ASSET_COLORS,
  getCircleCoordinates,
  getPieConfig,
} from "./PieChart.utils"
import {
  SliceLabelRest,
  TLabelRest,
} from "./components/SliceLabelRest/SliceLabelRest"
import { AnimatePresence } from "framer-motion"
import { SliceLabel } from "./components/SliceLabel/SliceLabel"
import { DefaultSliceLabel } from "./components/DefaultSliceLabel/DefaultSliceLabel"
import { PieSkeleton } from "./components/Skeleton/Skeleton"
import { ScrollablePicker } from "../ScrollablePicker/ScrollablePicker"
import { useMedia } from "react-use"
import { theme } from "theme"
import { t } from "i18next"
import { EmotionJSX } from "@emotion/react/types/jsx-namespace"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { TOmnipoolOverviewData } from "sections/stats/sections/overview/data/OmnipoolOverview.utils"
import { BN_0 } from "utils/constants"

export type TSlice = {
  percentage: number
  color: string
  label: EmotionJSX.Element
  symbol: string
  name: string
  assets?: TLabelRest[]
}

type DoughnutChartProps = {
  slices: TSlice[]
}

const DoughnutChart = ({ slices }: DoughnutChartProps) => {
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const PIE_SIZE = !isDesktop ? 170 : 300
  const config = getPieConfig(PIE_SIZE)
  const { t } = useTranslation()

  const [activeSlice, setActiveSlice] = useState<number | undefined>(undefined)

  const restCmp = slices.find((slice) => slice.symbol === "rest")
  const restIsSelected = restCmp && slices.length - 1 === activeSlice

  let label = <DefaultSliceLabel slices={slices} />

  if (activeSlice != null) {
    if (!isDesktop && restIsSelected) {
      label = (
        <Text color="basic100" fs={[20, 34]}>
          {t("value.percentage", { value: restCmp.percentage })}
        </Text>
      )
    } else {
      label = slices[activeSlice].label
    }
  }

  const sliceComponents = useMemo(() => {
    if (!slices.length) return null

    let diffAngle = 0
    const components = slices.map((slice, index) => {
      const sliceLength = slice.percentage * 3.6
      const startAngle = diffAngle
      const endAngle = sliceLength
      diffAngle += endAngle

      return (
        <Fragment key={slice.percentage}>
          <SClipPath
            rotate={startAngle}
            length={sliceLength - 1}
            color={slice.color}
            size={config.shadowSize}
            radial
            clipPath={getCircleCoordinates(
              config.shadowInnerRadius,
              config.innerRadius,
              config.shadowSize,
              slice.percentage,
            )}
          />

          <SClipPath
            rotate={startAngle}
            length={sliceLength - 1}
            color={slice.color}
            size={config.pieSize}
            clipPath={getCircleCoordinates(
              config.innerRadius,
              config.outerRadius,
              config.pieSize,
              slice.percentage,
            )}
          />

          <SClipPath
            rotate={startAngle}
            length={sliceLength - 1}
            color={slice.color}
            size={config.pieSize}
            isActive={activeSlice === index}
            clipPath={getCircleCoordinates(
              config.innerRadius,
              config.outerRadius,
              config.pieSize,
              slice.percentage,
            )}
            hoverClipPath={getCircleCoordinates(
              config.innerRadius,
              config.hoverOuterRadius,
              config.pieSize,
              slice.percentage,
            )}
            onMouseMove={() => setActiveSlice(index)}
            onMouseLeave={() => setActiveSlice(undefined)}
          />
        </Fragment>
      )
    })

    return <SSliceContainer size={config.pieSize}>{components}</SSliceContainer>
  }, [config, slices, activeSlice])

  return (
    <div sx={{ flex: "column", gap: 24 }}>
      <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
        <div css={{ position: "relative" }}>
          <SLabelContainer size={PIE_SIZE - config.shadowInnerRadius}>
            <AnimatePresence>{label}</AnimatePresence>
          </SLabelContainer>
          <svg width={PIE_SIZE} height={PIE_SIZE}>
            <foreignObject width={PIE_SIZE} height={PIE_SIZE}>
              {sliceComponents}
            </foreignObject>
          </svg>
        </div>
        {!isDesktop ? (
          <ScrollablePicker
            values={[
              {
                name: t("stats.overview.pie.rest.label"),
                color: "white",
                symbol: "overview",
                label: <Fragment />,
                percentage: 0,
              },
              ...slices,
            ]}
            onChange={setActiveSlice}
          />
        ) : null}
      </div>
      {!isDesktop && restIsSelected ? restCmp.label : null}
    </div>
  )
}

type PieChartProps = {
  data: TOmnipoolOverviewData
}

export const PieChart = ({ data }: PieChartProps) => {
  if (!data) return <PieSkeleton />

  const tvlTotal = data.reduce(
    (acc, omnipoolAsset) => omnipoolAsset.tvl.plus(acc),
    BN_0,
  )

  const slices = data
    ?.reduce((acc, omnipoolAsset) => {
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
    }, [] as TSlice[])
    .sort((a) => (a.symbol !== "rest" ? -1 : 0))

  return <DoughnutChart slices={slices} />
}
