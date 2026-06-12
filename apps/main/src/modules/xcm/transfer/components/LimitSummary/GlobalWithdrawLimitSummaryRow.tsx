import {
  Flex,
  SummaryRow,
  Tooltip,
  TooltipIcon,
} from "@galacticcouncil/ui/components"
import type { GlobalWithdrawLimit } from "@galacticcouncil/xc-cfg/build/clients/chain/hydration/circuit-breaker"
import { useTranslation } from "react-i18next"

import { GlobalWithdrawLimitInfo } from "@/modules/xcm/transfer/components/LimitSummary/GlobalWithdrawLimitInfo"

type GlobalWithdrawLimitSummaryRowProps = {
  globalWithdrawLimit: GlobalWithdrawLimit
  headroomUsd: string
  loading?: boolean
}

export const GlobalWithdrawLimitSummaryRow = ({
  globalWithdrawLimit,
  headroomUsd,
  loading,
}: GlobalWithdrawLimitSummaryRowProps) => {
  const { t } = useTranslation(["common", "xcm"])

  return (
    <SummaryRow
      label={t("xcm:summary.withdrawLimit")}
      loading={loading}
      content={
        <Tooltip
          text={
            <GlobalWithdrawLimitInfo
              globalWithdrawLimit={globalWithdrawLimit}
              headroomUsd={headroomUsd}
            />
          }
          asChild
        >
          <Flex align="center" gap="xs">
            {t("currency", {
              value: headroomUsd,
              maximumFractionDigits: 0,
            })}
            <TooltipIcon />
          </Flex>
        </Tooltip>
      }
    />
  )
}
