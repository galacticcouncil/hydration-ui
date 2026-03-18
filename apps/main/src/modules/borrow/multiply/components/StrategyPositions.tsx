import { useFormattedHealthFactor } from "@galacticcouncil/money-market/hooks"
import {
  CollapsibleContent,
  CollapsibleRoot,
  DataTable,
  Flex,
  Paper,
  SectionHeader,
  Separator,
  Skeleton,
  Stack,
  SValueStatsValue,
  TableContainer,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { StrategyPositionWrapper } from "@/modules/borrow/multiply/components/StrategyPosition"
import {
  getStrategyPositionsColumnsVisibility,
  useStrategyAssetsColumns,
  useStrategyGroupedPositions,
} from "@/modules/borrow/multiply/components/StrategyPositions.utils"

const LOW_HF_THRESHOLD = 1.5

type StrategyPositionsProps = {
  className?: string
}

export const StrategyPositions: React.FC<StrategyPositionsProps> = ({
  className,
}) => {
  const { isMobile } = useBreakpoints()
  const { t } = useTranslation("common")

  const { data, isLoading } = useStrategyGroupedPositions()
  const assetsColumns = useStrategyAssetsColumns()

  const { totalNetWorth, avgApy, totalPositionsWithLowHF } = useMemo(() => {
    if (!data.length) {
      return {
        totalNetWorth: 0,
        avgApy: 0,
        totalPositionsWithLowHF: 0,
      }
    }

    const { totalNetWorth, totalWeightedApy, totalPositionsWithLowHF } =
      data.reduce(
        (acc, row) => {
          const netWorth = Number(row.netWorth)
          const avgApy = Number(row.avgApy ?? 0)

          return {
            totalNetWorth: acc.totalNetWorth + netWorth,
            totalWeightedApy: acc.totalWeightedApy + avgApy * netWorth,
            totalPositionsWithLowHF:
              acc.totalPositionsWithLowHF +
              row.positions.filter(
                (position) =>
                  Big(position.healthFactor).lte(LOW_HF_THRESHOLD) &&
                  Big(position.healthFactor).gt(1),
              ).length,
          }
        },
        {
          totalNetWorth: 0,
          totalWeightedApy: 0,
          totalPositionsWithLowHF: 0,
        },
      )

    return {
      totalNetWorth,
      avgApy: totalNetWorth ? totalWeightedApy / totalNetWorth : 0,
      totalPositionsWithLowHF,
    }
  }, [data])

  const { healthFactorColor } = useFormattedHealthFactor(
    LOW_HF_THRESHOLD.toString(),
  )

  return (
    <CollapsibleRoot open={!isLoading && data.length > 0}>
      <CollapsibleContent className={className}>
        <TableContainer as={Paper}>
          <SectionHeader
            title={t("myPositions")}
            noTopPadding
            hasDescription
            sx={{ px: ["base", "l"], pt: "l" }}
          />
          <Separator mt="m" />

          <Stack
            direction={["column", null, "row"]}
            justify="flex-start"
            m="m"
            gap={[10, null, 40, 60]}
            separated
            separator={<Separator my="m" />}
          >
            <ValueStats
              label="My total net worth"
              value={t("currency", { value: totalNetWorth })}
              isLoading={isLoading}
              wrap={[false, false, true]}
            />
            <ValueStats
              label="Average APY"
              value={t("percent", { value: avgApy * 100 })}
              isLoading={isLoading}
              wrap={[false, false, true]}
            />
            {totalPositionsWithLowHF > 0 && (
              <ValueStats
                label={`Positions amount with HF < ${LOW_HF_THRESHOLD}`}
                value={t("number", { value: totalPositionsWithLowHF })}
                isLoading={isLoading}
                wrap={[false, false, true]}
                customValue={
                  <Flex align="center" gap="base">
                    <SValueStatsValue
                      size="large"
                      sx={{ color: healthFactorColor }}
                    >
                      {isLoading ? (
                        <Skeleton width={50} />
                      ) : (
                        t("number", { value: totalPositionsWithLowHF })
                      )}
                    </SValueStatsValue>
                  </Flex>
                }
              />
            )}
          </Stack>

          <Separator my="m" />

          <DataTable
            size="small"
            data={data}
            columns={assetsColumns}
            isLoading={isLoading}
            columnVisibility={getStrategyPositionsColumnsVisibility(isMobile)}
            expandable={"single"}
            getIsExpandable={({ positionsAmount }) => positionsAmount > 0}
            renderSubComponent={(row) => (
              <Flex direction="column" gap="m">
                {row.positions.map((position) => (
                  <StrategyPositionWrapper
                    key={position.proxyAddress}
                    position={position}
                  />
                ))}
              </Flex>
            )}
          />
        </TableContainer>
      </CollapsibleContent>
    </CollapsibleRoot>
  )
}
