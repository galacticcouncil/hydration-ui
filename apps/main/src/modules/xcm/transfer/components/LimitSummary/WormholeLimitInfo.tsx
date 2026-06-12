import {
  Box,
  ExternalLink,
  Flex,
  ProgressBar,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { AnyChain } from "@galacticcouncil/xc-core"
import { WormholeRateLimit } from "@galacticcouncil/xc-sdk"
import { useTranslation } from "react-i18next"

import { WORMHOLE_GOVERNOR_DOCS_LINK } from "@/config/links"
import { getGovernorUsagePercent } from "@/modules/xcm/transfer/utils/limits"

export type WormholeLimitInfoProps = {
  rateLimit: WormholeRateLimit
  emitterChain: AnyChain
}

export const WormholeLimitInfo: React.FC<WormholeLimitInfoProps> = ({
  rateLimit,
  emitterChain,
}) => {
  const { t } = useTranslation(["common", "xcm"])
  const usagePercent = getGovernorUsagePercent(rateLimit)
  const hasUsage = usagePercent !== null && usagePercent > 0

  return (
    <Stack gap="base">
      <Text fs="p4">
        {t("xcm:limit.wormhole.description", {
          chainName: emitterChain.name,
        })}{" "}
        <ExternalLink
          href={WORMHOLE_GOVERNOR_DOCS_LINK}
          sx={{ color: getToken("text.tint.secondary") }}
        >
          {t("readMore")}
        </ExternalLink>
      </Text>

      <Flex align="center" justify="space-between" gap="xs">
        <Text fs="p4" fw={500}>
          {t("xcm:limit.wormhole.maxTransfer")}
        </Text>
        <Text fs="p4" fw={600} color={getToken("text.tint.secondary")}>
          {t("currency", {
            value: rateLimit.maxTransactionSize,
            maximumFractionDigits: 0,
          })}
        </Text>
      </Flex>
      <Flex align="center" justify="space-between" gap="xs">
        <Text fs="p4" fw={500}>
          {t("xcm:limit.headroom")}
        </Text>
        <Text fs="p4" fw={600} color={getToken("text.tint.secondary")}>
          {t("currency", {
            value: rateLimit.availableNotional,
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
        </Box>
      )}
    </Stack>
  )
}
