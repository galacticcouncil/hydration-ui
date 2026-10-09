import {
  CircleDot,
  Coins,
  Hourglass,
  Landmark,
  Wallet,
} from "@galacticcouncil/ui/assets/icons"
import { Amount, Flex, Text, Tooltip } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Fragment } from "react"
import { useTranslation } from "react-i18next"

import { SAssetDetailMobileSeparator } from "@/modules/portfolio/overview/MyAssets/AssetDetailNativeMobileModal.styled"
import { ExpandedRowSeparator } from "@/modules/portfolio/overview/MyAssets/ExpandedRowSeparator"
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
  const rows = [
    {
      id: "status",
      content: position.strategy === "bil" && (
        <Amount
          variant="horizontalLabel"
          label={t("common:status")}
          labelIcon={CircleDot}
          value={t(
            `myStrategies.status.${position.status === "supplied" ? "supplied" : "wallet"}`,
          )}
        />
      ),
    },
    {
      id: "underlying",
      content: (
        <Amount
          variant="horizontalLabel"
          label={t("myStrategies.details.underlying")}
          labelIcon={Coins}
          value={
            position.underlyingAmount === null
              ? "—"
              : t("common:currency", {
                  value: position.underlyingAmount,
                  symbol: position.underlyingSymbol,
                })
          }
        />
      ),
    },
    {
      id: "rate",
      content: showMainMetrics && (
        <StrategyPositionRate position={position} withLabel horizontalLabel />
      ),
    },
    {
      id: "borrowed",
      content: position.status === "supplied" && (
        <Amount
          variant="horizontalLabel"
          label={t("myStrategies.details.borrowed")}
          labelIcon={Landmark}
          value={
            position.borrowedValue === null
              ? "—"
              : t("common:currency", { value: position.borrowedValue })
          }
        />
      ),
    },
    {
      id: "netValue",
      content: position.status === "supplied" && (
        <Amount
          variant="horizontalLabel"
          label={t("myStrategies.details.netValue")}
          labelIcon={Wallet}
          value={
            position.netValue === null
              ? "—"
              : t("common:currency", { value: position.netValue })
          }
        />
      ),
    },
    {
      id: "earnings",
      content: showMainMetrics && (
        <StrategyPositionEarnings
          position={position}
          withLabel
          horizontalLabel
        />
      ),
    },
    {
      id: "withdrawal",
      content: position.hasPendingWithdrawal && (
        <Amount
          variant="horizontalLabel"
          labelIcon={Hourglass}
          label={
            <Flex align="center" gap="xs">
              <Text fs="p4" lh="s" color={getToken("text.low")}>
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
      ),
    },
  ].filter(({ content }) => content)

  return (
    <Flex direction="column" gap="xl">
      {rows.map(({ id, content }, index) => (
        <Fragment key={id}>
          {index > 0 &&
            (showMainMetrics ? (
              <SAssetDetailMobileSeparator />
            ) : (
              <ExpandedRowSeparator />
            ))}
          {content}
        </Fragment>
      ))}
      {position.recoveryPending && (
        <Text fs="p6" color={getToken("text.medium")}>
          {t("myStrategies.details.recoveryPending")}
        </Text>
      )}
    </Flex>
  )
}
