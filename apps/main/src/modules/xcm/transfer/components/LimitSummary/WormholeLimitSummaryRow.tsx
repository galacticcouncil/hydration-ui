import {
  Flex,
  SummaryRow,
  Tooltip,
  TooltipIcon,
} from "@galacticcouncil/ui/components"
import { AnyChain } from "@galacticcouncil/xc-core"
import type { WormholeRateLimit } from "@galacticcouncil/xc-sdk"
import { useTranslation } from "react-i18next"

import { WormholeLimitInfo } from "@/modules/xcm/transfer/components/LimitSummary/WormholeLimitInfo"

type WormholeLimitSummaryRowProps = {
  rateLimit: WormholeRateLimit
  emitterChain: AnyChain
  loading?: boolean
}

export const WormholeLimitSummaryRow = ({
  rateLimit,
  emitterChain,
  loading,
}: WormholeLimitSummaryRowProps) => {
  const { t } = useTranslation(["common", "xcm"])

  return (
    <SummaryRow
      label={t("xcm:summary.wormholeLimit")}
      loading={loading}
      content={
        <Tooltip
          text={
            <WormholeLimitInfo
              rateLimit={rateLimit}
              emitterChain={emitterChain}
            />
          }
          asChild
        >
          <Flex align="center" gap="xs">
            {t("currency", {
              value: rateLimit.availableNotional,
              maximumFractionDigits: 0,
            })}
            <TooltipIcon />
          </Flex>
        </Tooltip>
      }
    />
  )
}
