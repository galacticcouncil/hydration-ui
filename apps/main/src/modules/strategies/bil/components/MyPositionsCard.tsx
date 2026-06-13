import {
  Box,
  Button,
  Flex,
  MicroButton,
  Paper,
  PositionCard,
  Separator,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { DecentralLogo } from "@/modules/strategies/bil/components/DecentralLogo"

export type PositionRow = {
  /** Stable id for react-table key + filtering. */
  id: "supplied" | "raw"
  label: string
  amount: number
  usdValue: number
  /** Net worth (USD), after borrow. For the supplied row only — raw rows
      report the same as amount × rate (not collateralised, no borrow). */
  netWorthUsd: number
  /** Your net APY %, including borrow effects. */
  netApyPercent: number
  /** Whether to show the recovery Deposit button (raw BIL only). */
  isRaw: boolean
}

interface Props {
  bilSupplied: number
  bilRaw: number
  /** BIL → HOLLAR exchange rate (HOLLAR is $-pegged so this also gives USD). */
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
  bilSupplied,
  bilRaw,
  exchangeRate,
  apyPercent,
  netWorthUsd,
  minDisplayBalance,
  onWithdraw,
  onDepositRaw,
  isDepositingRaw,
}: Props) => {
  const { t } = useTranslation(["bil", "common"])

  const collateralLabel = t("strategy.collateralAsset")
  const hasSupplied = bilSupplied >= minDisplayBalance
  const hasRaw = bilRaw >= minDisplayBalance

  const rows: PositionRow[] = []
  if (hasSupplied) {
    rows.push({
      id: "supplied",
      label: collateralLabel,
      amount: bilSupplied,
      usdValue: bilSupplied * exchangeRate,
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
      amount: bilRaw,
      usdValue: bilRaw * exchangeRate,
      // Raw rows are not collateralised — net worth equals their face value.
      netWorthUsd: bilRaw * exchangeRate,
      netApyPercent: apyPercent,
      isRaw: true,
    })
  }

  return (
    <Paper>
      <Box p="l">
        <Text as="h2" font="primary" fs="base" fw={500}>
          {t("positions.title")}
        </Text>
      </Box>
      <Separator />
      <Flex direction="column" gap="m" p="m">
        {rows.map((row) => (
          <PositionCard
            key={row.id}
            logo={<DecentralLogo size={32} />}
            symbol={row.label}
            stats={
              <>
                <ValueStats
                  wrap
                  size="small"
                  font="secondary"
                  label={t("positions.col.amount")}
                  customValue={
                    <Text fs="p3" fw={500} lh={1}>
                      {t("common:currency", {
                        value: row.amount,
                        symbol: "aBIL",
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
              </>
            }
            cta={
              <>
                {row.isRaw && (
                  <MicroButton
                    onClick={onDepositRaw}
                    disabled={isDepositingRaw}
                  >
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
              </>
            }
          />
        ))}
      </Flex>
    </Paper>
  )
}
