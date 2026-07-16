import {
  Box,
  Flex,
  FlexProps,
  Separator,
  Tooltip,
  TooltipIcon,
  ValueStats,
  ValueStatsLabel,
  ValueStatsSize,
  ValueStatsValue,
} from "@galacticcouncil/ui/components"
import { getSpacingValue } from "@galacticcouncil/ui/utils"
import { FC, Fragment, ReactNode } from "react"

type StatItem = {
  readonly label: string
  readonly value?: string
  readonly valueColor?: string
  readonly customValue?: ReactNode
  readonly tooltip?: ReactNode
  readonly bottomLabel?: string
  readonly customBottomLabel?: ReactNode
  readonly isLoading?: boolean
  readonly size?: ValueStatsSize
  readonly wrap?: boolean
}

type StatsHeaderProps = Omit<FlexProps, "children"> & {
  readonly stats: StatItem[]
}

export const StatsHeader: FC<StatsHeaderProps> = ({
  stats,
  gap = getSpacingValue("primary"),
  justify = "space-between",
  className,
  sx,
  ...props
}) => {
  const mergedClassName = ["no-scrollbar", className].filter(Boolean).join(" ")

  return (
    <Flex
      gap={gap}
      justify={justify}
      className={mergedClassName}
      sx={{
        pt: getSpacingValue("secondary"),
        pb: getSpacingValue("secondary"),
        my: 0,
        overflowX: "auto",
        ...sx,
      }}
      {...props}
    >
      {stats.map((stat, index) => {
        const size = stat.size ?? "large"
        const customValue =
          stat.customValue ??
          (stat.valueColor ? (
            <ValueStatsValue size={size} style={{ color: stat.valueColor }}>
              {stat.value}
            </ValueStatsValue>
          ) : undefined)
        const customLabel = stat.tooltip ? (
          <Flex align="center" gap={getSpacingValue("s")}>
            <ValueStatsLabel>{stat.label}</ValueStatsLabel>
            <TooltipIcon />
          </Flex>
        ) : undefined

        const valueStats = (
          <ValueStats
            label={stat.label}
            customLabel={customLabel}
            size={size}
            wrap={stat.wrap ?? true}
            value={!customValue ? stat.value : undefined}
            customValue={customValue}
            bottomLabel={stat.bottomLabel}
            customBottomLabel={stat.customBottomLabel}
            isLoading={stat.isLoading}
          />
        )

        return (
          <Fragment key={`${stat.label}-${index}`}>
            {stat.tooltip ? (
              <Tooltip text={stat.tooltip} side="top" align="center" asChild>
                <Box>{valueStats}</Box>
              </Tooltip>
            ) : (
              valueStats
            )}
            {index < stats.length - 1 && (
              <Separator
                orientation="vertical"
                sx={{
                  my: getSpacingValue("quart"),
                  flexShrink: 0,
                }}
              />
            )}
          </Fragment>
        )
      })}
    </Flex>
  )
}
