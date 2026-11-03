import {
  Box,
  Card,
  CardBody,
  CardHeader,
  CardTable,
  CardTitle,
  DataTable,
  Separator,
  TableContainer,
  ValueStats,
  ValueStatsGroup,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { isNullish } from "remeda"

import { DepositModal } from "@/modules/strategies/juicer/components/DepositModal"
import { useStrategyVaultColumns } from "@/modules/strategies/juicer/components/StrategyVaults.columns"
import {
  JUICER_RISK_PROFILE,
  type JuicerVaultConfig,
} from "@/modules/strategies/juicer/config/vaults"
import { useJuicerVaults } from "@/modules/strategies/juicer/hooks/useJuicerVaults"

export const StrategyDetailsCard: FC = () => {
  const { t } = useTranslation(["juicer", "common"])
  const { gte } = useBreakpoints()
  const { vaults, subLoop, totalTvlUsd, isLoading } = useJuicerVaults()
  const [depositVault, setDepositVault] = useState<JuicerVaultConfig | null>(
    null,
  )

  const columns = useStrategyVaultColumns(setDepositVault)
  const leverage = subLoop?.leverage

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("strategy.title")}</CardTitle>
      </CardHeader>
      <CardBody>
        <ValueStatsGroup>
          <ValueStats
            wrap
            size="medium"
            label={t("strategy.totalTvl")}
            value={t("common:currency.compact", { value: totalTvlUsd })}
            isLoading={isLoading}
          />
          <ValueStats
            wrap
            size="medium"
            label={t("strategy.loopLeverage")}
            value={
              isNullish(leverage)
                ? "—"
                : t("strategy.loopLeverageValue", { value: leverage })
            }
            isLoading={isLoading}
          />
          <ValueStats
            wrap
            size="medium"
            label={t("strategy.riskProfile")}
            value={t(`strategy.risk.${JUICER_RISK_PROFILE}`)}
          />
        </ValueStatsGroup>
      </CardBody>
      <Separator />
      {!gte("xl") ? (
        <Box p="m" asChild>
          <CardTable
            data={vaults}
            columns={columns}
            isLoading={isLoading}
            statsColumns={2}
          />
        </Box>
      ) : (
        <TableContainer borderRadius="xl">
          <DataTable data={vaults} columns={columns} size="small" />
        </TableContainer>
      )}

      <DepositModal
        vault={depositVault}
        onClose={() => setDepositVault(null)}
      />
    </Card>
  )
}
