import { useFormattedHealthFactor } from "@galacticcouncil/money-market/hooks"
import {
  DataTable,
  Flex,
  Paper,
  Separator,
  Skeleton,
  Stack,
  SValueStatsValue,
  TableContainer,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
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

export const StrategyPositions = () => {
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
    <TableContainer as={Paper} sx={{ mt: "xxl" }}>
      <Flex
        align="center"
        justify="space-between"
        sx={{
          px: ["base", "l"],
          py: "l",
          borderBottom: "1px solid",
          borderColor: getToken("details.separators"),
        }}
      >
        <Text fs="p3" fw={500} font="primary" color={getToken("text.high")}>
          {t("myPositions")}
        </Text>
      </Flex>

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
  )
}
