import {
  Box,
  Flex,
  ProgressBar,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
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
        return t("xcm:depositLimit.tooltip.window.lockdown", {
          value: periodWindow.durationMs,
        })
      case "reset":
        return t("xcm:depositLimit.tooltip.window.reset", {
          value: periodWindow.durationMs,
        })
      case "expired":
        return t("xcm:depositLimit.tooltip.window.expired")
    }
  })()

  const hasUsage = usagePercent !== null

  if (!hasUsage && !periodWindowText) return null

  return (
    <Stack gap="base">
      {hasUsage && (
        <Box minWidth={pxToRem(180)}>
          <Flex align="center" justify="space-between" gap="xs">
            <Text fs="p4" fw={500}>
              {t("xcm:depositLimit.limitUsage")}
            </Text>
            <Text fs="p4" fw={600} color={getToken("text.tint.secondary")}>
              {t("percent", { value: usagePercent })}
            </Text>
          </Flex>
          <ProgressBar value={usagePercent} hideLabel />
        </Box>
      )}
      {periodWindowText && (
        <Text fs="p4" color={getToken("text.medium")}>
          {periodWindowText}
        </Text>
      )}
    </Stack>
  )
}
