import {
  Flex,
  SummaryRow,
  SummaryRowLabel,
  Text,
  Tooltip,
  TooltipIcon,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import type { GlobalWithdrawLimit } from "@galacticcouncil/xc-cfg/build/clients/chain/hydration/circuit-breaker"
import { useTranslation } from "react-i18next"

import { CBreakerOutboundLimitInfo } from "@/modules/xcm/transfer/components/LimitSummary/CBreakerOutboundLimitInfo"

type CBreakerOutboundLimitSummaryRowProps = {
  globalWithdrawLimit: GlobalWithdrawLimit
  headroomUsd: string
  loading?: boolean
}

export const CBreakerOutboundLimitSummaryRow = ({
  globalWithdrawLimit,
  headroomUsd,
  loading,
}: CBreakerOutboundLimitSummaryRowProps) => {
  const { t } = useTranslation(["common", "xcm"])

  return (
    <SummaryRow
      sx={{ my: 0 }}
      label={
        <SummaryRowLabel fw={500} color={getToken("text.high")}>
          {t("xcm:summary.cBreakerOutboundLimit")}:
        </SummaryRowLabel>
      }
      loading={loading}
      content={
        <Tooltip
          text={
            <CBreakerOutboundLimitInfo
              globalWithdrawLimit={globalWithdrawLimit}
              headroomUsd={headroomUsd}
            />
          }
          asChild
        >
          <Flex align="center" gap="xs" asChild>
            <Text fs="p5" fw={600} color={getToken("text.high")}>
              {t("currency.compact", {
                value: headroomUsd,
              })}
              <TooltipIcon />
            </Text>
          </Flex>
        </Tooltip>
      }
    />
  )
}
