import {
  Amount,
  Flex,
  Grid,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import {
  StrategyPositionEarnings,
  StrategyPositionRate,
} from "@/modules/portfolio/overview/MyStrategies/MyStrategies.columns"
import { StrategyPosition } from "@/modules/portfolio/overview/MyStrategies/MyStrategies.data"

export const MyStrategiesDetails = ({
  position,
  showMainMetrics = false,
}: {
  position: StrategyPosition
  showMainMetrics?: boolean
}) => {
  const { t } = useTranslation(["wallet", "common"])

  return (
    <Flex direction="column" gap="m">
      <Grid columns={[1, null, position.status === "supplied" ? 4 : 3]} gap="l">
        {position.strategy === "bil" && (
          <Amount
            label={t("common:status")}
            value={t(
              `myStrategies.status.${position.status === "supplied" ? "supplied" : "wallet"}`,
            )}
          />
        )}
        <Amount
          label={t("myStrategies.details.underlying")}
          value={
            position.underlyingAmount === null
              ? "—"
              : t("common:currency", {
                  value: position.underlyingAmount,
                  symbol: position.underlyingSymbol,
                })
          }
        />
        {showMainMetrics && (
          <StrategyPositionRate position={position} withLabel />
        )}
        {position.status === "supplied" && (
          <>
            <Amount
              label={t("myStrategies.details.borrowed")}
              value={
                position.borrowedValue === null
                  ? "—"
                  : t("common:currency", { value: position.borrowedValue })
              }
            />
            <Amount
              label={t("myStrategies.details.netValue")}
              value={
                position.netValue === null
                  ? "—"
                  : t("common:currency", { value: position.netValue })
              }
            />
          </>
        )}
        {showMainMetrics && (
          <StrategyPositionEarnings position={position} withLabel />
        )}
        {position.pendingEarnings !== null && (
          <Amount
            label={
              <Flex align="center" gap="xs">
                <Text fs="p5" lh="s" color={getToken("text.medium")}>
                  {t("myStrategies.details.pendingEarnings")}
                </Text>
                <Tooltip
                  text={t("myStrategies.details.pendingEarnings.note")}
                />
              </Flex>
            }
            value={t("common:currency", {
              value: position.pendingEarnings,
              symbol: position.symbol,
            })}
          />
        )}
        {position.hasPendingWithdrawal && (
          <Amount
            label={
              <Flex align="center" gap="xs">
                <Text fs="p5" lh="s" color={getToken("text.medium")}>
                  {t(
                    position.isPendingWithdrawalEstimate
                      ? "myStrategies.details.withdrawalEstimate"
                      : "myStrategies.details.withdrawal",
                  )}
                </Text>
                <Tooltip text={t("myStrategies.details.withdrawal.note")} />
              </Flex>
            }
            value={t("common:currency", {
              value: position.pendingWithdrawal,
              symbol: position.symbol,
            })}
          />
        )}
        {position.recoveryHollar !== null && (
          <Amount
            label={t("myStrategies.details.recovery")}
            value={t("common:currency", {
              value: position.recoveryHollar,
              symbol: "HOLLAR",
            })}
          />
        )}
      </Grid>
      {position.recoveryPending && (
        <Text fs="p6" color={getToken("text.medium")}>
          {t("myStrategies.details.recoveryPending")}
        </Text>
      )}
    </Flex>
  )
}
