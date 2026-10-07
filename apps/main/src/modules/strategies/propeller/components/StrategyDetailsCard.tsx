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
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { isNullish } from "remeda"

import { DepositModal } from "@/modules/strategies/propeller/components/DepositModal"
import { useStrategyVaultColumns } from "@/modules/strategies/propeller/components/StrategyVaults.columns"
import {
  PROPELLER_RISK_PROFILE,
  type PropellerVaultConfig,
} from "@/modules/strategies/propeller/config/vaults"
import { usePropellerVaults } from "@/modules/strategies/propeller/hooks/usePropellerVaults"

export const StrategyDetailsCard = () => {
  const { t } = useTranslation(["propeller", "common"])
  const { isMobile, isTablet } = useBreakpoints()
  const { vaults, subLoop, totalTvlUsd, isLoading } = usePropellerVaults()
  const [depositVault, setDepositVault] = useState<PropellerVaultConfig | null>(
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
            value={t(`strategy.risk.${PROPELLER_RISK_PROFILE}`)}
          />
        </ValueStatsGroup>
      </CardBody>
      <Separator />
      {isMobile || isTablet ? (
        <Box p="m" asChild>
          <CardTable data={vaults} columns={columns} isLoading={isLoading} />
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
