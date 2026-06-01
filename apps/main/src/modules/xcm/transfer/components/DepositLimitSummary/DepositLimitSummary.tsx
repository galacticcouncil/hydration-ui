import {
  Box,
  Flex,
  ProgressBar,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { AssetDepositLimit } from "@galacticcouncil/xc-cfg/build/clients"
import { useTranslation } from "react-i18next"

import { useBestNumber } from "@/api/chain"
import {
  getDepositLimitPeriodWindow,
  getDepositLimitUsagePercent,
} from "@/modules/xcm/transfer/utils/limits"
import { useRpcProvider } from "@/providers/rpcProvider"

export type DepositLimitSummaryProps = {
  depositLimit: AssetDepositLimit
}

export const DepositLimitSummary: React.FC<DepositLimitSummaryProps> = ({
  depositLimit,
}) => {
  const { t } = useTranslation(["common", "xcm"])
  const { slotDurationMs } = useRpcProvider()

  const { data: bestNumber } = useBestNumber()
  const usagePercent = getDepositLimitUsagePercent(depositLimit)
  const currentBlock = bestNumber?.parachainBlockNumber

  const periodWindow =
    currentBlock !== undefined
      ? getDepositLimitPeriodWindow(depositLimit, currentBlock, slotDurationMs)
      : undefined

  const periodWindowText = (() => {
    if (!periodWindow) return null
    switch (periodWindow.type) {
      case "lockdown":
        return t("xcm:limit.tooltip.window.lockdown", {
          value: periodWindow.durationMs,
        })
      case "reset":
        return t("xcm:limit.tooltip.window.reset", {
          value: periodWindow.durationMs,
        })
      case "expired":
        return t("xcm:limit.tooltip.window.expired")
    }
  })()

  const hasUsage = usagePercent !== null && usagePercent > 0

  return (
    <Stack gap="base">
      <Text fs="p4">{t("xcm:limit.description")}</Text>
      {hasUsage && (
        <Box>
          <Flex align="center" justify="space-between" gap="xs">
            <Text fs="p4" fw={500}>
              {t("xcm:limit.usage")}
            </Text>
            <Text fs="p4" fw={600} color={getToken("text.tint.secondary")}>
              {t("percent", { value: usagePercent })}
            </Text>
          </Flex>
          <ProgressBar value={usagePercent} hideLabel />
          {periodWindowText && (
            <Text fs="p4" color={getToken("text.medium")}>
              {periodWindowText}
            </Text>
          )}
        </Box>
      )}
    </Stack>
  )
}
