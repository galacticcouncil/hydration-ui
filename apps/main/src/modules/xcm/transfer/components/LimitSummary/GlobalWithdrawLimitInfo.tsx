import {
  Box,
  Flex,
  ProgressBar,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import type { GlobalWithdrawLimit } from "@galacticcouncil/xc-cfg/build/clients/chain/hydration/circuit-breaker"
import { useTranslation } from "react-i18next"

import { useBlockTimestamp } from "@/api/chain"
import { getGlobalWithdrawLimitUsagePercent } from "@/modules/xcm/transfer/utils/limits"

export type GlobalWithdrawLimitInfoProps = {
  globalWithdrawLimit: GlobalWithdrawLimit
  headroomUsd: string
}

export const GlobalWithdrawLimitInfo: React.FC<
  GlobalWithdrawLimitInfoProps
> = ({ globalWithdrawLimit, headroomUsd }) => {
  const { t } = useTranslation(["common", "xcm"])
  const { data: blockTimestamp } = useBlockTimestamp()
  const usagePercent = getGlobalWithdrawLimitUsagePercent(globalWithdrawLimit)
  const hasUsage = usagePercent !== null && usagePercent > 0

  const periodWindowText = (() => {
    if (!blockTimestamp) return null
    if (globalWithdrawLimit.lockdown && globalWithdrawLimit.lockdownUntilMs) {
      const durationMs = globalWithdrawLimit.lockdownUntilMs - blockTimestamp
      if (durationMs > 0n) {
        return t("xcm:limit.tooltip.window.lockdown", {
          value: Number(durationMs),
        })
      }
    }
    if (!globalWithdrawLimit.lockdown && globalWithdrawLimit.windowMs > 0n) {
      const resetMs =
        globalWithdrawLimit.lastUpdateMs +
        globalWithdrawLimit.windowMs -
        blockTimestamp
      if (resetMs > 0n) {
        return t("xcm:limit.tooltip.window.reset", { value: Number(resetMs) })
      }
    }
    return null
  })()

  return (
    <Stack gap="base">
      <Text fs="p4">{t("xcm:limit.withdraw.description")}</Text>
      <Flex align="center" justify="space-between" gap="xs">
        <Text fs="p4" fw={500}>
          {t("xcm:limit.headroom")}
        </Text>
        <Text fs="p4" fw={600} color={getToken("text.tint.secondary")}>
          {t("currency", {
            value: headroomUsd,
            maximumFractionDigits: 0,
          })}
        </Text>
      </Flex>
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
