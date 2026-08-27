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

import { useBestNumber, useBlockTime } from "@/api/chain"
import {
  getDepositLimitPeriodWindow,
  getDepositLimitUsagePercent,
} from "@/modules/xcm/transfer/utils/limits"
import { toDecimal } from "@/utils/formatting"

export type CBreakerInboundLimitInfoProps = {
  depositLimit: AssetDepositLimit
}

export const CBreakerInboundLimitInfo: React.FC<
  CBreakerInboundLimitInfoProps
> = ({ depositLimit }) => {
  const { t } = useTranslation(["common", "xcm"])
  const { data: blockTimeMs } = useBlockTime()

  const { data: bestNumber } = useBestNumber()
  const usagePercent = getDepositLimitUsagePercent(depositLimit)
  const currentBlock = bestNumber?.parachainBlockNumber

  const periodWindow =
    currentBlock !== undefined && blockTimeMs
      ? getDepositLimitPeriodWindow(depositLimit, currentBlock, blockTimeMs)
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
  const headroomValue = depositLimit.headroom
    ? toDecimal(depositLimit.headroom, depositLimit.decimals)
    : null

  return (
    <Stack gap="base">
      <Text fs="p3">{t("xcm:limit.cBreaker.inbound.description")}</Text>
      {headroomValue && (
        <Flex align="center" justify="space-between" gap="xs">
          <Text fs="p3" fw={500}>
            {t("xcm:limit.headroom")}
          </Text>
          <Text fs="p3" fw={600} color={getToken("text.tint.secondary")}>
            {t("currency.compact", {
              value: headroomValue,
              symbol: depositLimit.symbol,
            })}
          </Text>
        </Flex>
      )}
      {hasUsage && (
        <Box>
          <Flex align="center" justify="space-between" gap="xs">
            <Text fs="p3" fw={500}>
              {t("xcm:limit.usage")}
            </Text>
            <Text fs="p3" fw={600} color={getToken("text.tint.secondary")}>
              {t("percent", { value: usagePercent })}
            </Text>
          </Flex>
          <ProgressBar value={usagePercent} hideLabel />
          {periodWindowText && (
            <Text fs="p3" color={getToken("text.medium")}>
              {periodWindowText}
            </Text>
          )}
        </Box>
      )}
    </Stack>
  )
}
