import {
  Amount,
  Flex,
  Grid,
  ResponsiveScope,
  Text,
  Tooltip,
  ValueStats,
  ValueStatsLabel,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, ReactNode } from "react"

import { AssetLogo } from "@/components/AssetLogo"
import {
  SActionSection,
  SActionsGroup,
  SAmountSection,
  SMobileSeparator,
  SPendingPosition,
  SStat,
  SStatusSection,
} from "@/components/PendingPosition/PendingPosition.styled"

export type PendingPositionStat = {
  /** omitted for a two-line stat that mirrors the amount column */
  label?: string
  value: ReactNode
  /** small secondary line under the value */
  bottomLabel?: string
  tooltip?: string
}

type PendingPositionProps = {
  assetId: string
  value: string
  /** one line, or several stacked under the amount */
  displayValue?: string | ReadonlyArray<string>
  isLoading?: boolean
  stats?: PendingPositionStat[]
  status?: ReactNode
  action?: ReactNode
  /** keep the wrapped layout at every width: stats get their own row */
  forceWrap?: boolean
}

export const PendingPosition: FC<PendingPositionProps> = ({
  assetId,
  value,
  displayValue,
  isLoading,
  stats,
  status,
  action,
  forceWrap,
}) => (
  <ResponsiveScope>
    <SPendingPosition forceWrap={forceWrap}>
      <SAmountSection forceWrap={forceWrap}>
        <AssetLogo id={assetId} />
        <Amount
          value={value}
          displayValue={displayValue}
          isLoading={isLoading}
        />
      </SAmountSection>
      <SMobileSeparator forceWrap={forceWrap} />
      <SActionsGroup forceWrap={forceWrap}>
        <SStatusSection forceWrap={forceWrap}>
          {forceWrap && stats ? (
            // the card layout of CardTable: two even columns, more stats wrap
            <Grid
              columns="repeat(2, minmax(0, 1fr))"
              columnGap="l"
              rowGap="m"
              align="start"
              width="100%"
            >
              {stats.map((stat, index) => (
                <ValueStats
                  key={stat.label ?? index}
                  wrap
                  size="small"
                  font="secondary"
                  customLabel={
                    <ValueStatsLabel sx={{ whiteSpace: "normal" }}>
                      {stat.label}
                    </ValueStatsLabel>
                  }
                  bottomLabel={stat.bottomLabel}
                  customValue={
                    <Flex align="center" gap="s">
                      <Text fs="p4" fw={500} color={getToken("text.high")}>
                        {stat.value}
                      </Text>
                      {stat.tooltip && <Tooltip asChild text={stat.tooltip} />}
                    </Flex>
                  }
                />
              ))}
            </Grid>
          ) : (
            stats?.map((stat, index) => (
              <SStat key={stat.label ?? index}>
                <ValueStats
                  label={stat.label}
                  customLabel={stat.label === undefined ? <></> : undefined}
                  bottomLabel={stat.bottomLabel}
                  customValue={
                    <Flex align="center" gap="s">
                      <Text
                        as="div"
                        fs="p5"
                        lh={1}
                        fw={500}
                        color={getToken("text.high")}
                        whiteSpace="nowrap"
                      >
                        {stat.value}
                      </Text>
                      {stat.tooltip && <Tooltip asChild text={stat.tooltip} />}
                    </Flex>
                  }
                  wrap={false}
                  size="small"
                  sx={{ alignItems: "flex-end" }}
                />
              </SStat>
            ))
          )}
          {!forceWrap && status}
        </SStatusSection>
        {/* wrapped, the stats take their own row: status sits by the amount */}
        {(action || (forceWrap && status)) && (
          <SActionSection forceWrap={forceWrap}>
            <Flex align="center" gap="m">
              {forceWrap && status}
              {action}
            </Flex>
          </SActionSection>
        )}
      </SActionsGroup>
    </SPendingPosition>
  </ResponsiveScope>
)
