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
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { StrategyPosition } from "@/modules/borrow/multiply/components/StrategyPosition"
import {
  getStratgiesColumnsVisibility,
  useStrategyAssetsColumns,
  useStrategyGroupedPositions,
} from "@/modules/borrow/multiply/components/StrategyPositions.utils"

export const StrategyPositions = () => {
  const { isMobile } = useBreakpoints()
  const { t } = useTranslation("common")

  const { data, isLoading } = useStrategyGroupedPositions()
  const assetsColumns = useStrategyAssetsColumns()

  const { totalNetWorth, avgApy, avgHealthFactor } = useMemo(() => {
    if (!data.length) {
      return {
        totalNetWorth: 0,
        avgApy: 0,
        avgHealthFactor: 0,
      }
    }

    const {
      totalNetWorth,
      totalWeightedApy,
      totalHealthFactor,
      totalPositions,
    } = data.reduce(
      (acc, row) => {
        const positions = row.positionsAmount
        const netWorth = Number(row.netWorth)
        const avgApy = Number(row.avgApy ?? 0)
        const avgHealthFactor = Math.max(0, Number(row.avgHealthFactor ?? 0))

        return {
          totalNetWorth: acc.totalNetWorth + netWorth,
          totalWeightedApy: acc.totalWeightedApy + avgApy * netWorth,
          totalHealthFactor:
            acc.totalHealthFactor + avgHealthFactor * Number(positions ?? 0),
          totalPositions: acc.totalPositions + Number(positions ?? 0),
        }
      },
      {
        totalNetWorth: 0,
        totalWeightedApy: 0,
        totalHealthFactor: 0,
        totalPositions: 0,
      },
    )

    return {
      totalNetWorth,
      avgApy: totalNetWorth ? totalWeightedApy / totalNetWorth : 0,
      avgHealthFactor: totalPositions ? totalHealthFactor / totalPositions : 0,
    }
  }, [data])

  const {
    healthFactor: formattedHealthFactor,
    healthFactorColor,
    isHealthFactorValid,
  } = useFormattedHealthFactor(
    avgHealthFactor ? avgHealthFactor.toString() : "-1",
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
        <ValueStats
          label="Average health factor"
          value={
            isHealthFactorValid
              ? t("number", { value: formattedHealthFactor })
              : "-"
          }
          isLoading={isLoading}
          wrap={[false, false, true]}
          customValue={
            <Flex align="center" gap="base">
              <SValueStatsValue size="large" sx={{ color: healthFactorColor }}>
                {isLoading ? (
                  <Skeleton width={50} />
                ) : isHealthFactorValid ? (
                  t("number", {
                    value: formattedHealthFactor,
                    maximumFractionDigits: 2,
                    notation: "compact",
                  })
                ) : (
                  "-"
                )}
              </SValueStatsValue>
            </Flex>
          }
        />
      </Stack>

      <Separator my="m" />

      <DataTable
        size="small"
        data={data}
        columns={assetsColumns}
        isLoading={isLoading}
        columnVisibility={getStratgiesColumnsVisibility(isMobile)}
        expandable={"single"}
        getIsExpandable={({ positionsAmount }) => positionsAmount > 0}
        renderSubComponent={(row) => (
          <Flex direction="column" gap="m">
            {row.positions.map((position) => (
              <StrategyPosition
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
