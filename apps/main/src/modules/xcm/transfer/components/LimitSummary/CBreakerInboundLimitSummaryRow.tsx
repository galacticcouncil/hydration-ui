import {
  Flex,
  SummaryRow,
  SummaryRowLabel,
  Text,
  Tooltip,
  TooltipIcon,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import type { AssetDepositLimit } from "@galacticcouncil/xc-cfg/build/clients/chain/hydration/circuit-breaker"
import { useTranslation } from "react-i18next"

import { CBreakerInboundLimitInfo } from "@/modules/xcm/transfer/components/LimitSummary/CBreakerInboundLimitInfo"
import { toDecimal } from "@/utils/formatting"

type CBreakerInboundLimitSummaryRowProps = {
  depositLimit: AssetDepositLimit
  loading?: boolean
}

export const CBreakerInboundLimitSummaryRow = ({
  depositLimit,
  loading,
}: CBreakerInboundLimitSummaryRowProps) => {
  const { t } = useTranslation(["common", "xcm"])

  return (
    <SummaryRow
      sx={{ my: 0 }}
      label={
        <SummaryRowLabel fw={500} color={getToken("text.high")}>
          {t("xcm:summary.cBreakerInboundLimit")}:
        </SummaryRowLabel>
      }
      loading={loading}
      content={
        <Tooltip
          text={<CBreakerInboundLimitInfo depositLimit={depositLimit} />}
          asChild
        >
          <Flex align="center" gap="xs" asChild>
            <Text fs="p5" fw={600} color={getToken("text.high")}>
              {t("currency.compact", {
                value: toDecimal(
                  depositLimit.headroom ?? 0n,
                  depositLimit.decimals,
                ),
                symbol: depositLimit.symbol,
              })}
              <TooltipIcon />
            </Text>
          </Flex>
        </Tooltip>
      }
    />
  )
}
