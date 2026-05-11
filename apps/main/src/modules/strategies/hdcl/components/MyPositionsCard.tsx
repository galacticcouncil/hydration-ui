import {
  Box,
  Button,
  Flex,
  MicroButton,
  Paper,
  Separator,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { StackedTable } from "@/modules/borrow/dashboard/components/StackedTable"
import { DecentralLogo } from "@/modules/strategies/hdcl/components/DecentralLogo"

import {
  type ColumnHandlers,
  type PositionRow,
  usePositionColumns,
} from "./MyPositions.columns"

interface Props {
  hdclSupplied: number
  hdclRaw: number
  /** HDCL → HOLLAR exchange rate (HOLLAR is $-pegged so this also gives USD). */
  exchangeRate: number
  /** Strategy APY %. */
  apyPercent: number
  /** Net worth in USD, after deducting outstanding HOLLAR debt. */
  netWorthUsd: number
  /**
   * Minimum balance considered "real" — anything below is treated as dust
   * and the corresponding row is hidden.
   */
  minDisplayBalance: number
  onWithdraw: (id: PositionRow["id"]) => void
  onDepositRaw: () => void
  isDepositingRaw: boolean
}

export const MyPositionsCard = ({
  hdclSupplied,
  hdclRaw,
  exchangeRate,
  apyPercent,
  netWorthUsd,
  minDisplayBalance,
  onWithdraw,
  onDepositRaw,
  isDepositingRaw,
}: Props) => {
  const { t } = useTranslation(["hdcl", "common"])
  const { isMobile, isTablet } = useBreakpoints()

  const collateralLabel = t("strategy.collateralAsset")
  const hasSupplied = hdclSupplied >= minDisplayBalance
  const hasRaw = hdclRaw >= minDisplayBalance

  const rows: PositionRow[] = []
  if (hasSupplied) {
    rows.push({
      id: "supplied",
      label: collateralLabel,
      amount: hdclSupplied,
      usdValue: hdclSupplied * exchangeRate,
      // Net worth = collateral USD - debt USD. We pass the post-borrow value
      // through the parent (it knows the debt); for the supplied row it's the
      // user's actual net worth in this strategy.
      netWorthUsd,
      netApyPercent: apyPercent,
      isRaw: false,
    })
  }
  if (hasRaw) {
    rows.push({
      id: "raw",
      label: t("positions.uncollateralised", { label: collateralLabel }),
      amount: hdclRaw,
      usdValue: hdclRaw * exchangeRate,
      // Raw rows are not collateralised — net worth equals their face value.
      netWorthUsd: hdclRaw * exchangeRate,
      netApyPercent: apyPercent,
      isRaw: true,
    })
  }

  const handlers: ColumnHandlers = {
    onWithdraw,
    onDepositRaw,
    isDepositingRaw,
  }
  const columns = usePositionColumns(handlers)

  const renderDesktopRow = (row: PositionRow) => (
    <Paper key={row.id} p="l" shadow={false}>
      <Flex align="center">
        <Flex align="center" gap="s">
          <DecentralLogo size={32} />
          <Text fs="p3" fw={500} color={getToken("text.high")}>
            {row.label}
          </Text>
        </Flex>

        <Flex
          align="center"
          justify="space-around"
          gap="xxl"
          px="xl"
          flex={1}
          sx={{ minWidth: 0 }}
        >
          <ValueStats
            wrap
            size="small"
            font="secondary"
            label={t("positions.col.amount")}
            customValue={
              <Text fs="p3" fw={500} lh={1}>
                {t("common:currency", {
                  value: row.amount,
                  symbol: "aHDCL",
                })}
              </Text>
            }
            bottomLabel={t("common:currency", {
              value: row.usdValue,
            })}
          />
          <ValueStats
            wrap
            size="small"
            font="secondary"
            label={t("positions.col.netWorth")}
            customValue={
              <Text fs="p3" fw={500} lh={1}>
                {t("common:currency", {
                  value: row.netWorthUsd,
                })}
              </Text>
            }
            bottomLabel={t("positions.afterBorrow")}
          />
          <ValueStats
            wrap
            size="small"
            font="secondary"
            label={t("positions.col.netApy")}
            customValue={
              <Text fs="p3" fw={500} lh={1}>
                {t("common:percent", {
                  value: row.netApyPercent,
                })}
              </Text>
            }
            bottomLabel={t("positions.inclBorrow")}
          />
        </Flex>

        <Flex justify="flex-end" align="center" gap="s">
          {row.isRaw && (
            <MicroButton onClick={onDepositRaw} disabled={isDepositingRaw}>
              {isDepositingRaw
                ? t("positions.action.depositing")
                : t("positions.action.deposit")}
            </MicroButton>
          )}
          <Button
            variant="tertiary"
            size="small"
            onClick={() => onWithdraw(row.id)}
          >
            {t("positions.action.withdraw")}
          </Button>
        </Flex>
      </Flex>
    </Paper>
  )

  return (
    <Paper>
      <Box p="l">
        <Text as="h2" font="primary" fs="base" fw={500}>
          {t("positions.title")}
        </Text>
      </Box>
      <Separator />
      {rows.length === 0 ? (
        <Box px="l" py="xl">
          <Text fs="p4" color={getToken("text.low")}>
            {t("positions.empty")}
          </Text>
        </Box>
      ) : isMobile || isTablet ? (
        <Box px="m" pb="m">
          <StackedTable data={rows} columns={columns} />
        </Box>
      ) : (
        <Flex direction="column" gap="m" p="m">
          {rows.map(renderDesktopRow)}
        </Flex>
      )}
    </Paper>
  )
}
